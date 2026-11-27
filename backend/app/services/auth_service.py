from fastapi import HTTPException, status

from app.core.config import settings
from app.core.security import create_access_token, hash_password, verify_password
from app.models import Estudiante, Usuario
from app.models.enums import Rol
from app.repositories.usuario_repository import UsuarioRepository


class AuthService:
    def __init__(self, repo: UsuarioRepository):
        self.repo = repo

    def login(self, email: str, password: str) -> dict:
        usuario = self.repo.get_by_email(email)
        if not usuario:
            raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Credenciales inválidas")

        if usuario.bloqueado:
            raise HTTPException(status.HTTP_423_LOCKED, "Cuenta bloqueada por intentos fallidos")

        if not verify_password(password, usuario.password_hash):
            usuario.intentos_fallidos += 1
            if usuario.intentos_fallidos >= settings.MAX_LOGIN_ATTEMPTS:
                usuario.bloqueado = True
            self.repo.save(usuario)
            raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Credenciales inválidas")

        usuario.intentos_fallidos = 0
        self.repo.save(usuario)

        perfil = self.repo.get_perfil(usuario)
        return {
            "access_token": create_access_token(usuario.id, usuario.rol.value),
            "rol": usuario.rol.value,
            "nombre": getattr(perfil, "nombre", None),
        }
        
    def desbloquear(self, usuario_id: int) -> None:
        usuario = self.repo.get_by_id(usuario_id)
        if not usuario:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Usuario no encontrado")
        usuario.bloqueado = False
        usuario.intentos_fallidos = 0
        self.repo.save(usuario)

    def cambiar_password(self, usuario, actual: str, nueva: str) -> None:
        if not verify_password(actual, usuario.password_hash):
            raise HTTPException(status.HTTP_400_BAD_REQUEST, "La contraseña actual no es correcta")
        if actual == nueva:
            raise HTTPException(status.HTTP_400_BAD_REQUEST, "La nueva contraseña debe ser distinta")
        usuario.password_hash = hash_password(nueva)
        self.repo.save(usuario)

    def registrar_estudiante(self, data) -> dict:
        email = data.email.strip().lower()
        if self.repo.get_by_email(email):
            raise HTTPException(status.HTTP_409_CONFLICT, "Ya existe una cuenta con ese correo")
        usuario = Usuario(email=email, password_hash=hash_password(data.password), rol=Rol.ESTUDIANTE)
        perfil = Estudiante(nombre=data.nombre.strip(), creditos_cursados=data.creditos_cursados,
                            promedio=data.promedio, semestre=data.semestre)
        usuario = self.repo.crear_estudiante(usuario, perfil)
        return {
            "access_token": create_access_token(usuario.id, usuario.rol.value),
            "rol": usuario.rol.value,
            "nombre": perfil.nombre,
        }
