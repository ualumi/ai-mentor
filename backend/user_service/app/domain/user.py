from app.core.security import hash_password, verify_password

class UserAggregate:
    def __init__(self, username: str, email: str, password_hash: str):
        self.username = username
        self.email = email
        self.password_hash = password_hash

    @classmethod
    def register(cls, username: str, email: str, password: str):
        password_hash = hash_password(password)
        return cls(username, email, password_hash)

    def check_password(self, password: str) -> bool:
        return verify_password(password, self.password_hash)
