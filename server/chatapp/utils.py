"""Useful functions"""
import uuid
from datetime import datetime
from functools import wraps

import jwt
from django.contrib.auth import get_user_model
from django.http import HttpResponse
from rest_framework import status

from chatapp.models import Conversation
from typing import List, Tuple, Any

User = get_user_model()


def is_database_empty(YourModel: Any):
    return YourModel.objects.count() == 0


def strip_time_stamp(date: datetime) -> datetime | str:
    """Gets the appropriate timestamp"""
    today = datetime.today()
    answer = date.strftime('%d/%m/%Y')
    if date.year == today.year and date.month == today.month:
        if today.day == date.day:
            answer = date.strftime("%I:%M %p")
        elif today.day > date.day and today.day - date.day == 1:
            answer = 'Yesterday'
    return answer


def get_chat_room(user1: User, user2: User) -> Any:
    """Gets the chat room of the two users passed"""
    chat_room = None
    for room in Conversation.objects.all():
        if user1 in room.users.all() and user2 in room.users.all():
            chat_room = room
            break

    if chat_room is None:
        chat_room = Conversation.objects.create(room_name=f"Room_{str(uuid.uuid4())[:8]}")
        chat_room.users.add(user1, user2)
        chat_room.save()

    return chat_room


def customised_sort(users_with_timestamps: List[Tuple[User, datetime | None]]) -> List[Tuple[User, datetime | None]]:
    """Sorts the list passed in terms of timestamps"""
    new_list = list()
    # Adding users with messages in new list.
    for tu in users_with_timestamps:
        if tu[1]:
            new_list.append(tu)
    # Sorting the new list.
    new_list = sorted(new_list, key=lambda x: x[1], reverse=True)
    # Adding the rest of users without messages
    for tu in users_with_timestamps:
        if tu[1] is None:
            new_list.append(tu)
    return new_list


def login_required(view_func):
    """A decorator function that checks if the user is authenticated"""

    @wraps(view_func)
    def wrapper(request, *args, **kwargs):
        # Get the JWT token from the request cookie
        token = request.COOKIES.get('jwt')

        if not token:
            # Handle unauthorized access (e.g., redirect to login page)
            return HttpResponse('Unauthorized', status=status.HTTP_401_UNAUTHORIZED)

        try:
            # Verify and decode the JWT token
            payload = jwt.decode(token, 'secret', algorithms=['HS256'])
            # Attach the user information to the request object
            user_id = payload['id']
            request.user = User.objects.get(id=user_id)
            print(request.user.username)
        except jwt.ExpiredSignatureError:
            # Handle expired token
            return HttpResponse('Token expired', status=status.HTTP_401_UNAUTHORIZED)
        except jwt.InvalidTokenError:
            # Handle invalid token
            return HttpResponse('Invalid token', status=status.HTTP_401_UNAUTHORIZED)

        # Call the protected view function
        return view_func(request, *args, **kwargs)

    return wrapper


def get_user_from_request(request: Any) -> Tuple[Any, Any]:
    # Get the JWT token from the request cookie
    token = request.COOKIES.get('jwt')
    # Verify and decode the JWT token
    payload = jwt.decode(token, 'secret', algorithms=['HS256'])
    user_id = payload['id']
    request.user = User.objects.get(id=user_id)
    print(request.user.username)
    return request, request.user
