import requests
from datetime import datetime

'''
지출 DATA 양식
{
    "ID": "UserId"
    "Time":"Time" #Year,month,day,time
    "Currency":"BTC" #KRW, USD 등등
    "amount":"1000.99"
}
'''

def getCurrency(base_currency,raw_currency,amount):
    
    '''
    여러 가지 통화로 지출된 값을 베이스 환율로 변환해 반환
    출력형식: float
    '''

    url = "https://api.frankfurter.dev/v1/latest"

    if base_currency == raw_currency:
        return amount
    
    params = {
    "base": "raw_currency",
    "symbols": "base_currency",
    }
    try:
        response = requests.get(url, params=params)
        response.raise_for_status()  # HTTP 에러(예: 404, 500) 발생 시 예외 처리
        data = response.json()
        
        # 환율 데이터 추출 및 금액 계산
        exchange_rate = data["rates"][base_currency]
        converted_amount = amount * exchange_rate
        
        return converted_amount
        
    except Exception as e:
        print(f"환율 변환 실패 ({raw_currency} -> {base_currency}): {e}")
        return None

def _format_date(time_str: str) -> str:
    '''
    다양한 날짜/시간 문자열에서 YYYY-MM-DD 형식을 추출
    '''
    for fmt in ("%Y-%m-%d %H:%M:%S", "%Y-%m-%d %H:%M", "%Y-%m-%d", "%Y/%m/%d", "%Y.%m.%d"):
        try:
            return datetime.strptime(time_str.strip(), fmt).strftime("%Y-%m-%d")
        except ValueError:
            continue
    # 공백 기준으로 앞부분 날짜만 슬라이싱 시도
    return time_str.strip().split(" ")[0]

def getCurrencyfromTime(base_currency: str, raw_currency: str, amount: float | str, time: str) -> float | None:
    '''
    여러 가지 통화로 지출된 값을 결제 시점(과거 날짜) 환율로 변환해 반환
    출력형식: float
    중앙유럽 표준시(CET/CEST, 독일 프랑크푸르트 시간) 기준
    '''
    amount = float(amount)
    base_currency = base_currency.upper()
    raw_currency = raw_currency.upper()

    if base_currency == raw_currency:
        return amount

    date_str = _format_date(time)
    url = f"https://api.frankfurter.dev/v1/{date_str}"
    params = {
        "base": raw_currency,
        "symbols": base_currency,
    }

    try:
        response = requests.get(url, params=params, timeout=10)
        response.raise_for_status()
        data = response.json()

        exchange_rate = data["rates"][base_currency]
        return amount * exchange_rate

    except Exception as e:
        print(f"결제 시점({date_str}) 환율 변환 실패 ({raw_currency} -> {base_currency}): {e}")
        return None

def get_supported_currencies():

    '''
    지원하는 통화 목록을 반환
    출력예시:
    {
        "AUD": "Australian Dollar",
        "CAD": "Canadian Dollar",
        "CHF": "Swiss Franc",
        "EUR": "Euro",
        "GBP": "British Pound",
        "KRW": "South Korean Won",
        "USD": "United States Dollar"
    }
    '''
    url = "https://api.frankfurter.dev/v1/currencies"
    
    try:
        response = requests.get(url)
        response.raise_for_status() # HTTP 에러 발생 시 예외 처리
        currencies = response.json()
        
        return currencies
        
    except Exception as e:
        print(f"통화 목록을 가져오는 중 오류가 발생했습니다: {e}")
        return None

'''
실행 테스트용 예시코드
supported_currencies = get_supported_currencies()

if supported_currencies:
    print(f"총 {len(supported_currencies)}개의 통화를 지원합니다.\n")
    
    # 5개만 예시로 출력하거나 전체를 출력할 수 있습니다.
    for symbol, name in supported_currencies.items():
        print(f"{symbol} : {name}")
        
'''