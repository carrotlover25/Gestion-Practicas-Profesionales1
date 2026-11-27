from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import Coordinador, Empresa, Estudiante, GestorIncidencias, Usuario
from app.models.enums import Rol


class UsuarioRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, user_id: int) -> Usuario | None:
        return self.db.get(Usuario, user_id)

    def get_by_email(self, email: str) -> Usuario | None:
        return self.db.scalar(select(Usuario).where(Usuario.email == email))

    def save(self, usuario: Usuario) -> Usuario:
        self.db.add(usuario)
        self.db.commit()
        self.db.refresh(usuario)
        return usuario

    def get_perfil(self, usuario: Usuario):
        """Devuelve la fila de Empresa, Estudiante, etc. según el rol."""
        modelo = {
            Rol.EMPRESA: Empresa,
            Rol.ESTUDIANTE: Estudiante,
            Rol.COORDINADOR: Coordinador,
            Rol.GESTOR: GestorIncidencias,
        }[usuario.rol]
        return self.db.scalar(select(modelo).where(modelo.usuario_id == usuario.id))
    
    def list_bloqueados(self) -> list[Usuario]:
        return list(self.db.scalars(select(Usuario).where(Usuario.bloqueado.is_(True))))

    def crear_estudiante(self, usuario: Usuario, estudiante: Estudiante) -> Usuario:
        """Guarda usuario y perfil de estudiante en una sola transacción."""
        self.db.add(usuario)
        self.db.flush()  # para obtener usuario.id
        estudiante.usuario_id = usuario.id
        self.db.add(estudiante)
        self.db.commit()
        self.db.refresh(usuario)
        return usuario
