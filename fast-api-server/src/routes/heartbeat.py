from fastapi import APIRouter

from src.schemas.response_body import SimpleMessageResponse

router = APIRouter()


@router.get(
    path="",
)
def heartbeat() -> SimpleMessageResponse:
    return SimpleMessageResponse(message="alive")
