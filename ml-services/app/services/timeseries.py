from typing import List

import pandas as pd
from prophet import Prophet

from .schemas import ForecastRequest, ForecastResponse, ForecastPoint


def forecast_prophet(request: ForecastRequest) -> ForecastResponse:
    df = pd.DataFrame({"ds": request.timestamps, "y": request.values})
    model = Prophet()
    model.fit(df)
    future = model.make_future_dataframe(periods=request.horizon)
    forecast_df = model.predict(future).tail(request.horizon)
    forecast = [
        ForecastPoint(timestamp=row['ds'].strftime('%Y-%m-%d'), value=float(row['yhat']))
        for _, row in forecast_df.iterrows()
    ]
    return ForecastResponse(model='prophet', forecast=forecast)
