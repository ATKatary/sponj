"""
User managers
"""
from utils import report
from http import HTTPStatus
from typing import Any, Coroutine
from asgiref.sync import sync_to_async
from django.core.validators import validate_email
from django.contrib.auth.models import BaseUserManager
from django.core.exceptions import ValidationError, ObjectDoesNotExist

##### Classes #####
class CustomUserManager(BaseUserManager):
    use_in_migrations = True
    
    def create(self, id, first_name, last_name, email, password = None):
        try: 
            validate_email(email)
            if self.get(email=email): 
                raise ValidationError("Email exists")
    
        except ValidationError as error:
            report(f"Error occured while signing up user\n{error}")
            return None, HTTPStatus.PRECONDITION_FAILED

        except ObjectDoesNotExist as error:
            user = self.model(
                id = id,
                email = email,
                last_name = last_name,
                first_name = first_name,
            )
    
            user.set_password(password)
            user.save(using = self._db)

            return user, HTTPStatus.CREATED

    def create_superuser(self, id, first_name, last_name, email, password = None):
        user, user_status = self.create(id, first_name, last_name, email, password=password)

        if user_status == HTTPStatus.CREATED:
            report("User created\nSetting permissions ...")
            user.is_staff = True
            user.is_admin = True
            user.is_superuser = True
            user.save(using = self._db)
        else: report(f"Failed to create user: {user_status}")

        return user, user_status

    async def acreate(self, id, first_name, last_name, email, password = None) -> Coroutine[Any, Any, Any]:
        report(f"Creating user...")
        return await sync_to_async(self.create)(id, first_name, last_name, email, password)

