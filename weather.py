import json
from typing import Any, Dict, Optional
import requests

WMO_WEATHER_CODES = {
    0: "맑음",
    1: "대체로 맑음",
    2: "구름 조금",
    3: "흐림",
    45: "안개",
    48: "서리 안개",
    51: "이슬비 (약함)",
    53: "이슬비 (보통)",
    55: "이슬비 (강함)",
    61: "비 (약함)",
    63: "비 (보통)",
    65: "비 (강함)",
    71: "눈 (약함)",
    73: "눈 (보통)",
    75: "눈 (강함)",
    80: "소나기 (약함)",
    81: "소나기 (보통)",
    82: "소나기 (강함)",
    95: "뇌우",
}


def get_detailed_weather_json(
    location_name: str, forecast_days: int = 3
) -> Optional[str]:
    """지명을 검색하여 좌표 변환 후, 상세 일별/시간별 예보를 구조화된 JSON 문자열로 반환합니다."""
    # 1. Geocoding API 호출
    geo_url = "https://geocoding-api.open-meteo.com/v1/search"
    geo_params = {
        "name": location_name,
        "count": 1,
        "language": "ko",
        "format": "json",
    }

    geo_res = requests.get(geo_url, params=geo_params, timeout=5)
    geo_res.raise_for_status()
    geo_data = geo_res.json()

    if not geo_data.get("results"):
        return None

    target = geo_data["results"][0]
    lat = target["latitude"]
    lon = target["longitude"]

    # 2. Weather Forecast API 파라미터 구성 (최대 상세 데이터 요청)
    forecast_url = "https://api.open-meteo.com/v1/forecast"
    forecast_params = {
        "latitude": lat,
        "longitude": lon,
        "timezone": "auto",
        "forecast_days": forecast_days,
        "current": [
            "temperature_2m",
            "relative_humidity_2m",
            "apparent_temperature",
            "is_day",
            "precipitation",
            "weather_code",
            "wind_speed_10m",
            "surface_pressure",
        ],
        "hourly": [
            "temperature_2m",
            "apparent_temperature",
            "relative_humidity_2m",
            "precipitation_probability",
            "precipitation",
            "weather_code",
            "surface_pressure",
            "cloud_cover",
            "wind_speed_10m",
            "wind_direction_10m",
            "wind_gusts_10m",
            "uv_index",
        ],
        "daily": [
            "weather_code",
            "temperature_2m_max",
            "temperature_2m_min",
            "apparent_temperature_max",
            "apparent_temperature_min",
            "sunrise",
            "sunset",
            "uv_index_max",
            "precipitation_sum",
            "precipitation_probability_max",
            "wind_speed_10m_max",
            "wind_gusts_10m_max",
        ],
    }

    fc_res = requests.get(forecast_url, params=forecast_params, timeout=5)
    fc_res.raise_for_status()
    raw = fc_res.json()

    # 3. 시간별(Hourly) Columnar 데이터를 Record 단위 리스트로 재구성
    hourly_raw = raw.get("hourly", {})
    hourly_times = hourly_raw.get("time", [])
    hourly_records = []

    for i, t in enumerate(hourly_times):
        w_code = hourly_raw.get("weather_code", [])[i]
        hourly_records.append(
            {
                "time": t,
                "temperature": hourly_raw.get("temperature_2m", [])[i],
                "apparent_temperature": hourly_raw.get(
                    "apparent_temperature", []
                )[i],
                "relative_humidity": hourly_raw.get(
                    "relative_humidity_2m", []
                )[i],
                "precipitation_probability": hourly_raw.get(
                    "precipitation_probability", []
                )[i],
                "precipitation": hourly_raw.get("precipitation", [])[i],
                "weather_code": w_code,
                "weather_desc": WMO_WEATHER_CODES.get(w_code, "기타"),
                "cloud_cover": hourly_raw.get("cloud_cover", [])[i],
                "surface_pressure": hourly_raw.get("surface_pressure", [])[i],
                "wind_speed": hourly_raw.get("wind_speed_10m", [])[i],
                "wind_direction": hourly_raw.get("wind_direction_10m", [])[i],
                "wind_gusts": hourly_raw.get("wind_gusts_10m", [])[i],
                "uv_index": hourly_raw.get("uv_index", [])[i],
            }
        )

    # 4. 일별(Daily) Columnar 데이터를 Record 단위 리스트로 재구성
    daily_raw = raw.get("daily", {})
    daily_times = daily_raw.get("time", [])
    daily_records = []

    for i, d in enumerate(daily_times):
        d_code = daily_raw.get("weather_code", [])[i]
        daily_records.append(
            {
                "date": d,
                "weather_code": d_code,
                "weather_desc": WMO_WEATHER_CODES.get(d_code, "기타"),
                "temp_max": daily_raw.get("temperature_2m_max", [])[i],
                "temp_min": daily_raw.get("temperature_2m_min", [])[i],
                "apparent_temp_max": daily_raw.get(
                    "apparent_temperature_max", []
                )[i],
                "apparent_temp_min": daily_raw.get(
                    "apparent_temperature_min", []
                )[i],
                "precipitation_sum": daily_raw.get("precipitation_sum", [])[i],
                "precipitation_probability_max": daily_raw.get(
                    "precipitation_probability_max", []
                )[i],
                "uv_index_max": daily_raw.get("uv_index_max", [])[i],
                "wind_speed_max": daily_raw.get("wind_speed_10m_max", [])[i],
                "wind_gusts_max": daily_raw.get("wind_gusts_10m_max", [])[i],
                "sunrise": daily_raw.get("sunrise", [])[i],
                "sunset": daily_raw.get("sunset", [])[i],
            }
        )

    # 5. 최종 구조화 JSON 조립
    cur = raw.get("current", {})
    cur_code = cur.get("weather_code")

    result: Dict[str, Any] = {
        "location": {
            "query": location_name,
            "name": target.get("name"),
            "country": target.get("country"),
            "region": target.get("admin1"),
            "latitude": lat,
            "longitude": lon,
            "elevation": target.get("elevation"),
            "timezone": raw.get("timezone"),
            "timezone_abbreviation": raw.get("timezone_abbreviation"),
        },
        "units": {
            "temperature": raw.get("hourly_units", {}).get(
                "temperature_2m", "°C"
            ),
            "precipitation": raw.get("hourly_units", {}).get(
                "precipitation", "mm"
            ),
            "wind_speed": raw.get("hourly_units", {}).get(
                "wind_speed_10m", "km/h"
            ),
            "pressure": raw.get("hourly_units", {}).get(
                "surface_pressure", "hPa"
            ),
        },
        "current": {
            "time": cur.get("time"),
            "is_day": bool(cur.get("is_day")),
            "temperature": cur.get("temperature_2m"),
            "apparent_temperature": cur.get("apparent_temperature"),
            "relative_humidity": cur.get("relative_humidity_2m"),
            "precipitation": cur.get("precipitation"),
            "weather_code": cur_code,
            "weather_desc": WMO_WEATHER_CODES.get(cur_code, "기타"),
            "wind_speed": cur.get("wind_speed_10m"),
            "surface_pressure": cur.get("surface_pressure"),
        },
        "daily_forecast": daily_records,
        "hourly_forecast": hourly_records,
    }

    return json.dumps(result, ensure_ascii=False, indent=2)


if __name__ == "__main__":
    weather_json = get_detailed_weather_json("제주", forecast_days=2)
    if weather_json:
        print(weather_json[:1500] + "\n... (생략)")
