import requests


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