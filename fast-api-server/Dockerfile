# syntax=docker/dockerfile:1
# check=error=true

ARG PYTHON_VERSION=x

FROM python:${PYTHON_VERSION}-slim AS base
ENV PYTHONUNBUFFERED=1
WORKDIR /app

FROM base AS requirements-exporter
RUN pip install --no-cache-dir uv
COPY ./pyproject.toml ./uv.lock ./
RUN uv export --frozen --no-dev --format requirements-txt > requirements.txt
RUN uv export --frozen --format requirements-txt > requirements_dev.txt

FROM base AS development
COPY --from=requirements-exporter /app/requirements_dev.txt ./
RUN pip install --no-cache-dir -r requirements_dev.txt

FROM base AS production
ARG UID=10001
RUN adduser \
    --disabled-password \
    --gecos "" \
    --home "/nonexistent" \
    --shell "/sbin/nologin" \
    --no-create-home \
    --uid "${UID}" \
    appuser
COPY --from=requirements-exporter /app/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt
USER appuser
COPY ./src src
EXPOSE 8000
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0"]