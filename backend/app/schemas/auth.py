from pydantic import BaseModel, EmailStr, Field


class LoginIn(BaseModel):
    email: EmailStr
    password: str


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
    rol: str
    nombre: str | None = None


class UsuarioOut(BaseModel):
    id: int
    email: str
    rol: str
    
class CambiarPasswordIn(BaseModel):
    password_actual: str
    password_nueva: str = Field(min_length=8)


class RegistroEstudianteIn(BaseModel):
    nombre: str = Field(min_length=3, max_length=150)
    email: EmailStr
    password: str = Field(min_length=8)
    creditos_cursados: int = Field(ge=0)
    promedio: float = Field(ge=0, le=5)
    semestre: int = Field(ge=1, le=14)
