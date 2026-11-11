"""N-Trip 지출 관리 모듈. 여행마다 ExpenseBook을 하나씩 사용하며, 금액은 소수 넷째 자리까지 받고, 내부에서는 정산 통화의 0.0001 단위 정수로 계산한다.

이 모듈은 데이터베이스, HTTP, 참가자 등록 방식에 의존하지 않는다.
"""
from copy import deepcopy
from decimal import Decimal, InvalidOperation, ROUND_HALF_UP
from functools import lru_cache
from datetime import date
from math import isfinite


_AMOUNT_SCALE = 10_000
_AMOUNT_STEP = Decimal('0.0001')


def _members(values):
    """참가자 ID가 비어 있거나 중복되지 않는지 검사한다."""
    if isinstance(values, (str, bytes)):
        raise ValueError('participants must be a sequence of participant IDs')
    result = tuple(values)
    if not result or any(not isinstance(v, str) or not v.strip() for v in result):
        raise ValueError('participant IDs must be nonempty strings')
    if len(set(result)) != len(result):
        raise ValueError('duplicate participant IDs')
    return result


def _currency_code(value):
    """세 글자 통화 코드를 대문자로 정규화한다."""
    if not isinstance(value, str):
        raise ValueError('통화 코드는 문자열이어야 합니다.')
    code = value.strip().upper()
    if len(code) != 3 or not code.isascii() or not code.isalpha():
        raise ValueError('통화 코드는 USD처럼 영문 세 글자여야 합니다.')
    return code


def _payment_date(value):
    """YYYY-MM-DD 형식의 날짜를 검증한다."""
    if not isinstance(value, str):
        raise ValueError('날짜는 YYYY-MM-DD 형식이어야 합니다.')
    parsed = date.fromisoformat(value)
    if parsed.isoformat() != value:
        raise ValueError('날짜는 YYYY-MM-DD 형식이어야 합니다.')
    return parsed


def _positive_decimal(value):
    """지출 원금 또는 환율을 양수 Decimal로 변환한다."""
    if type(value) not in (int, float, Decimal):
        raise ValueError('금액과 환율은 숫자여야 합니다.')
    amount = Decimal(str(value))
    if not amount.is_finite() or amount <= 0:
        raise ValueError('금액과 환율은 유한한 양수여야 합니다.')
    try:
        number = float(amount)
    except OverflowError as error:
        raise ValueError('금액 또는 환율이 허용 범위를 벗어났습니다.') from error
    if not isfinite(number) or number == 0:
        raise ValueError('금액 또는 환율이 허용 범위를 벗어났습니다.')
    return amount


def _minor_units(value):
    """유한한 금액을 검증하고 0.0001원 단위 정수로 변환한다."""
    if type(value) not in (int, float, Decimal):
        raise ValueError('amount must be numeric')
    amount = Decimal(str(value))
    if not amount.is_finite():
        raise ValueError('amount must be finite')
    numerator, denominator = amount.as_integer_ratio()
    units, remainder = divmod(numerator * _AMOUNT_SCALE, denominator)
    if remainder:
        raise ValueError('amount must have at most four decimal places')
    return units


def _money(value, *, zero=False):
    """지출액 또는 부담액을 검증하고 0.0001원 단위 정수로 반환한다."""
    units = _minor_units(value)
    if units < (0 if zero else 1):
        raise ValueError('amount is below the allowed minimum')
    return units


def _share_units(shares, participants):
    """새 사용자 지정 부담액을 내부 정수 단위로 변환한다."""
    if set(shares) != set(participants):
        raise ValueError('shares must match beneficiaries exactly')
    return {person: _money(shares[person], zero=True) for person in participants}


def _public_expense(expense):
    """지출 내역을 복사하고 금액을 원 단위 float로 변환한다."""
    result = deepcopy(expense)
    result['amount'] /= _AMOUNT_SCALE
    result['shares'] = {person: units / _AMOUNT_SCALE for person, units in result['shares'].items()}
    return result


def minimize_transfers(balances, *, strategy='exact'):
    """잔액이 양수이면 받을 돈, 음수이면 보낼 돈이다.

    정확 탐색은 잔액이 0이 아닌 참가자가 최대 12명일 때 송금 횟수를 최소화한다.
    더 큰 모임에서는 strategy='greedy'를 지정할 수 있다. 이 방식은 최소 송금 횟수를 보장하지 않는다.
    """
    units = {person: _minor_units(value) for person, value in balances.items()}
    return _settle_units(units, strategy=strategy)


def _settle_units(balances, *, strategy):
    """0.0001원 단위 잔액으로 송금 계획을 계산하고 원 단위로 반환한다."""
    if strategy not in ('exact', 'greedy'):
        raise ValueError('unknown settlement strategy')
    for person, amount in balances.items():
        if not isinstance(person, str) or not person.strip() or type(amount) is not int:
            raise ValueError('invalid balance')
    if sum(balances.values()) != 0:
        raise ValueError('balances must sum to zero')
    people = tuple(p for p, value in balances.items() if value)
    initial = tuple(balances[p] for p in people)
    if strategy == 'exact' and len(people) > 12:
        raise ValueError('exact settlement supports at most 12 nonzero balances; use greedy explicitly')

    @lru_cache(None)
    def solve(state):
        """현재 잔액을 모두 정리하는 최소 송금 조합을 찾는다."""
        i = next((i for i, v in enumerate(state) if v), None)
        if i is None:
            return ()
        best = None
        seen = set()
        for j in range(i + 1, len(state)):
            if state[i] * state[j] >= 0 or state[j] in seen:
                continue
            seen.add(state[j])
            updated = list(state)
            # i의 잔액을 전부 정산한다. j는 받은 금액을 다른 참가자에게 전달할 수 있다.
            updated[j] += state[i]
            updated[i] = 0
            sender, receiver = (i, j) if state[i] < 0 else (j, i)
            candidate = ((sender, receiver, abs(state[i])),) + solve(tuple(updated))
            if best is None or len(candidate) < len(best):
                best = candidate
            if state[i] + state[j] == 0:
                break
        return best

    if strategy == 'exact':
        result = solve(initial)
    else:
        state = list(initial)
        result = []
        while any(state):
            debtor = min(range(len(state)), key=state.__getitem__)
            creditor = max(range(len(state)), key=state.__getitem__)
            amount = min(-state[debtor], state[creditor])
            result.append((debtor, creditor, amount))
            state[debtor] += amount
            state[creditor] -= amount
    return [
        dict(from_person=people[i], to_person=people[j], amount=value / _AMOUNT_SCALE)
        for i, j, value in result
    ]


class ExpenseBook:
    """여행별 지출을 메모리에 저장한다. 모임 모듈이 제공하는 고정된 참가자 ID를 사용한다.

    반환한 딕셔너리는 원본과 분리된 복사본이다. 변경에 실패하면 기존 상태를 유지한다.
    여러 요청에서 동시에 공유하는 운영용 저장소로 사용하기에는 적합하지 않다.
    """

    def __init__(self, participants, *, settlement_currency='KRW'):
        """참가자 목록과 비어 있는 여행 지출 장부를 초기화한다."""
        self._participants = _members(participants)
        self._settlement_currency = _currency_code(settlement_currency)
        self._expenses = {}
        self._next_id = 1

    @property
    def participants(self):
        """장부에 등록된 참가자 ID 목록을 반환한다."""
        return self._participants

    @property
    def settlement_currency(self):
        """이 여행의 정산 통화를 반환한다."""
        return self._settlement_currency

    def _validated(self, description, amount, paid_by, participants, shares=None):
        """지출 정보를 검증하고 참가자별 부담액을 계산한다."""
        participants = _members(participants)
        shares_units = None if shares is None else _share_units(shares, participants)
        return self._build_expense(description, _money(amount), paid_by, participants, shares_units)

    def _build_expense(self, description, amount, paid_by, participants, shares):
        """내부 정수 단위로 지출 내역을 구성하고 부담액 합계를 검증한다."""
        if not isinstance(description, str) or not description.strip():
            raise ValueError('description is required')
        members = participants
        if paid_by not in self._participants or not set(members) <= set(self._participants):
            raise ValueError('payer and beneficiaries must belong to this trip')
        if shares is None:
            quotient, remainder = divmod(amount, len(members))
            allocation = {p: quotient + (i < remainder) for i, p in enumerate(members)}
        else:
            if set(shares) != set(members):
                raise ValueError('shares must match beneficiaries exactly')
            allocation = {p: shares[p] for p in members}
            if sum(allocation.values()) != amount:
                raise ValueError('shares must sum to amount')
        return dict(
            description=description.strip(),
            amount=amount,
            paid_by=paid_by,
            participants=list(members),
            shares=allocation,
            allocation='equal' if shares is None else 'custom',
        )

    def add_expense(self, description, amount, paid_by, participants, *, shares=None):
        """지출을 등록하고 새 ID가 포함된 내역을 반환한다."""
        expense = self._validated(description, amount, paid_by, participants, shares)
        return self._register_expense(expense)

    def _register_expense(self, expense):
        """검증된 지출에 ID를 부여하고 장부에 저장한다."""
        expense_id = self._next_id
        expense['id'] = expense_id
        result = _public_expense(expense)
        self._expenses[expense_id] = expense
        self._next_id += 1
        return result

    def add_currency_expense(
        self, description, original_amount, expense_currency, paid_at,
        paid_by, participants, *, rate_info=None, shares=None,
    ):
        """결제일 기준 환율로 환산한 지출과 환율 정보를 함께 저장한다."""
        conversion = self._convert_expense(original_amount, expense_currency, paid_at, rate_info)
        amount = conversion['original_amount'] * conversion['exchange_rate']
        amount = amount.quantize(_AMOUNT_STEP, rounding=ROUND_HALF_UP)
        expense = self._validated(description, amount, paid_by, participants, shares)
        conversion['original_amount'] = float(conversion['original_amount'])
        conversion['exchange_rate'] = float(conversion['exchange_rate'])
        expense.update(conversion)
        return self._register_expense(expense)

    def _convert_expense(self, original_amount, expense_currency, paid_at, rate_info):
        """환율 응답의 통화 방향과 기준일을 검증한다."""
        original = _positive_decimal(original_amount)
        base = _currency_code(expense_currency)
        payment_date = _payment_date(paid_at)
        if base == self.settlement_currency:
            rate = Decimal(1)
            rate_date = payment_date
        else:
            if not isinstance(rate_info, dict):
                raise ValueError('결제일 기준 환율 응답이 필요합니다.')
            if rate_info.get('base') != base or rate_info.get('quote') != self.settlement_currency:
                raise ValueError('환율 응답의 통화 방향이 지출 및 정산 통화와 다릅니다.')
            rate_date = _payment_date(rate_info.get('date'))
            if rate_date > payment_date:
                raise ValueError('환율 기준일은 결제일보다 늦을 수 없습니다.')
            rate = _positive_decimal(rate_info.get('rate'))
        return dict(
            original_amount=original,
            expense_currency=base,
            settlement_currency=self.settlement_currency,
            paid_at=payment_date.isoformat(),
            exchange_rate=rate,
            rate_date=rate_date.isoformat(),
        )

    def get_expense(self, expense_id):
        """ID로 지출 한 건을 조회한다."""
        if type(expense_id) is not int or expense_id not in self._expenses:
            raise KeyError(expense_id)
        return _public_expense(self._expenses[expense_id])

    def get_expenses(self):
        """등록된 지출 내역 전체를 조회한다."""
        return [_public_expense(expense) for expense in self._expenses.values()]

    def update_expense(self, expense_id, **changes):
        """변경할 항목을 반영하고 검증을 통과한 지출을 저장한다."""
        if type(expense_id) is not int or expense_id not in self._expenses:
            raise KeyError(expense_id)
        old = self._expenses[expense_id]
        allowed = {'description', 'amount', 'paid_by', 'participants', 'shares'}
        if not changes.keys() <= allowed:
            raise ValueError('unknown expense field')
        if 'exchange_rate' in old and 'amount' in changes:
            raise ValueError('환산 지출의 금액을 바꾸려면 결제일 기준으로 다시 환산해야 합니다.')
        participants = _members(changes.get('participants', old['participants']))
        amount = _money(changes['amount']) if 'amount' in changes else old['amount']
        shares = old['shares'] if old['allocation'] == 'custom' else None
        if 'shares' in changes:
            new_shares = changes['shares']
            shares = None if new_shares is None else _share_units(new_shares, participants)
        validated = self._build_expense(
            changes.get('description', old['description']),
            amount,
            changes.get('paid_by', old['paid_by']),
            participants,
            shares,
        )
        # 검증된 지출 항목만 덮어쓰고 ID와 환율 기록은 유지한다.
        updated = old | validated
        result = _public_expense(updated)
        self._expenses[expense_id] = updated
        return result

    def delete_expense(self, expense_id):
        """ID로 지출을 삭제하고 삭제한 내역을 반환한다."""
        old = self.get_expense(expense_id)
        del self._expenses[expense_id]
        return old

    def summary(self):
        """개인별 결제액, 부담액, 잔액과 전체 지출을 집계한다."""
        return self._public_summary(self._summary_units())

    def _public_summary(self, report):
        """정수 단위 집계를 원 단위 float로 변환한다."""
        return {
            'total': report['total'] / _AMOUNT_SCALE,
            'settlement_currency': self.settlement_currency,
            'people': {
                person: {key: value / _AMOUNT_SCALE for key, value in row.items()}
                for person, row in report['people'].items()
            },
        }

    def _summary_units(self):
        """0.0001원 단위 정수로 결제액, 부담액, 잔액을 집계한다."""
        people = {p: dict(paid=0, owed=0, balance=0) for p in self.participants}
        for expense in self._expenses.values():
            people[expense['paid_by']]['paid'] += expense['amount']
            for person, amount in expense['shares'].items():
                people[person]['owed'] += amount
        for row in people.values():
            row['balance'] = row['paid'] - row['owed']
        return dict(total=sum(e['amount'] for e in self._expenses.values()), people=people)

    def settle(self, *, strategy='exact'):
        """개인별 잔액으로 송금 계획을 계산해 집계 결과와 함께 반환한다."""
        units = self._summary_units()
        report = self._public_summary(units)
        report['transfers'] = _settle_units(
            {p: row['balance'] for p, row in units['people'].items()},
            strategy=strategy,
        )
        report['strategy'] = strategy
        report['minimum_guaranteed'] = strategy == 'exact'
        return report


def _read_participants(prompt):
    """쉼표로 구분된 참가자 ID를 읽고 앞뒤 공백을 제거한다."""
    return [person.strip() for person in input(prompt).split(',')]


def _read_expense_fields():
    """터미널에서 지출 등록과 수정에 공통으로 필요한 값을 읽는다."""
    return dict(
        description=input('Description: '),
        amount=Decimal(input('KRW: ')),
        paid_by=input('Payer ID: ').strip(),
        participants=_read_participants('Beneficiary IDs (comma separated): '),
    )


def main():
    """터미널에서 실행하는 예제다. 서비스에서는 모임 모듈이 참가자 ID를 제공한다."""
    import json
    book = ExpenseBook(_read_participants('Participant IDs (comma separated): '))
    while True:
        command = input('add / list / update / delete / settle / quit: ').strip()
        try:
            if command == 'quit':
                break
            if command in ('add', 'update'):
                expense_id = int(input('Expense ID: ')) if command == 'update' else None
                fields = _read_expense_fields()
                if expense_id is None:
                    result = book.add_expense(**fields)
                else:
                    result = book.update_expense(expense_id, **fields, shares=None)
            elif command == 'delete':
                result = book.delete_expense(int(input('Expense ID: ')))
            elif command == 'list':
                result = book.get_expenses()
            elif command == 'settle':
                result = book.settle()
            else:
                print('Unknown command')
                continue
            print(json.dumps(result, ensure_ascii=False, indent=2))
        except (ValueError, KeyError, TypeError, InvalidOperation) as error:
            print('Invalid input:', error)


if __name__ == '__main__':
    main()
