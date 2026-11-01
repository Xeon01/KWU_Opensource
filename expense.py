"""N-Trip expense domain. One ExpenseBook per trip; amounts are integer KRW.

No database, HTTP, or participant registration assumptions are made here.
"""
from copy import deepcopy
from functools import lru_cache


def _members(values):
    if isinstance(values, (str, bytes)):
        raise ValueError('participants must be a sequence of participant IDs')
    result = tuple(values)
    if not result or any(not isinstance(v, str) or not v.strip() for v in result):
        raise ValueError('participant IDs must be nonempty strings')
    if len(set(result)) != len(result):
        raise ValueError('duplicate participant IDs')
    return result


def _money(value, *, zero=False):
    if type(value) is not int or value < (0 if zero else 1):
        raise ValueError('amount must be an integer KRW amount')
    return value


def minimize_transfers(balances, *, strategy='exact'):
    """Positive balance receives, negative balance pays.

    Exact search minimizes transfer COUNT, with a 12 nonzero-person limit.
    Explicit strategy='greedy' handles larger groups without optimality claims.
    """
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
            # Settle person i completely, allowing j to relay received money.
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
    return [dict(from_person=people[i], to_person=people[j], amount=value)
            for i, j, value in result]


class ExpenseBook:
    """In-memory trip-scoped service; use stable participant IDs from group module.

    Returned dictionaries are detached snapshots. Failed mutations are atomic.
    Instances are not a shared, concurrent production persistence layer.
    """

    def __init__(self, participants):
        self._participants = _members(participants)
        self._expenses = {}
        self._next_id = 1

    @property
    def participants(self):
        return self._participants

    def _validated(self, description, amount, paid_by, participants, shares=None):
        if not isinstance(description, str) or not description.strip():
            raise ValueError('description is required')
        amount = _money(amount)
        members = _members(participants)
        if paid_by not in self._participants or not set(members) <= set(self._participants):
            raise ValueError('payer and beneficiaries must belong to this trip')
        if shares is None:
            quotient, remainder = divmod(amount, len(members))
            allocation = {p: quotient + (i < remainder) for i, p in enumerate(members)}
        else:
            if set(shares) != set(members):
                raise ValueError('shares must match beneficiaries exactly')
            allocation = {p: _money(shares[p], zero=True) for p in members}
            if sum(allocation.values()) != amount:
                raise ValueError('shares must sum to amount')
        return dict(description=description.strip(), amount=amount, paid_by=paid_by,
                    participants=list(members), shares=allocation,
                    allocation='equal' if shares is None else 'custom')

    def add_expense(self, description, amount, paid_by, participants, *, shares=None):
        data = self._validated(description, amount, paid_by, participants, shares)
        data['id'] = self._next_id
        self._expenses[self._next_id] = data
        self._next_id += 1
        return deepcopy(data)

    def get_expense(self, expense_id):
        if type(expense_id) is not int or expense_id not in self._expenses:
            raise KeyError(expense_id)
        return deepcopy(self._expenses[expense_id])

    def get_expenses(self):
        return deepcopy(list(self._expenses.values()))

    def update_expense(self, expense_id, **changes):
        old = self.get_expense(expense_id)
        allowed = {'description', 'amount', 'paid_by', 'participants', 'shares'}
        if not changes.keys() <= allowed:
            raise ValueError('unknown expense field')
        data = {k: changes.get(k, old[k]) for k in allowed - {'shares'}}
        # Custom shares persist unless explicitly replaced (None means equal).
        shares = changes.get('shares', old['shares'] if old['allocation'] == 'custom' else None)
        updated = self._validated(**data, shares=shares)
        updated['id'] = expense_id
        self._expenses[expense_id] = updated
        return deepcopy(updated)

    def delete_expense(self, expense_id):
        old = self.get_expense(expense_id)
        del self._expenses[expense_id]
        return old

    def summary(self):
        people = {p: dict(paid=0, owed=0, balance=0) for p in self.participants}
        for expense in self._expenses.values():
            people[expense['paid_by']]['paid'] += expense['amount']
            for person, amount in expense['shares'].items():
                people[person]['owed'] += amount
        for row in people.values():
            row['balance'] = row['paid'] - row['owed']
        return dict(total=sum(e['amount'] for e in self._expenses.values()), people=people)

    def settle(self, *, strategy='exact'):
        report = self.summary()
        report['transfers'] = minimize_transfers(
            {p: row['balance'] for p, row in report['people'].items()}, strategy=strategy)
        report['strategy'] = strategy
        report['minimum_guaranteed'] = strategy == 'exact'
        return report


def main():
    """Interactive demonstration; group module supplies IDs in real use."""
    import json
    book = ExpenseBook(input('Participant IDs (comma separated): ').split(','))
    while True:
        command = input('add / list / update / delete / settle / quit: ').strip()
        try:
            if command == 'quit':
                break
            if command in ('add', 'update'):
                expense_id = int(input('Expense ID: ')) if command == 'update' else None
                fields = dict(description=input('Description: '), amount=int(input('KRW: ')),
                              paid_by=input('Payer ID: '),
                              participants=input('Beneficiary IDs (comma separated): ').split(','))
                result = (book.add_expense(**fields) if expense_id is None else
                          book.update_expense(expense_id, **fields, shares=None))
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
        except (ValueError, KeyError, TypeError) as error:
            print('Invalid input:', error)


if __name__ == '__main__':
    main()
