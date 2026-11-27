from fastapi import APIRouter, Depends
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db, require_role
from app.models import Usuario
from app.models.enums import Rol
from app.repositories.usuario_repository import UsuarioRepository
from app.schemas.auth import CambiarPasswordIn, LoginIn, RegistroEstudianteIn, TokenOut, UsuarioOut
from app.services.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/login", response_model=TokenOut)
def login(data: LoginIn, db: Session = Depends(get_db)):
    return AuthService(UsuarioRepository(db)).login(data.email, data.password)


@router.post("/registro-estudiante", response_model=TokenOut, status_code=201)
def registro_estudiante(data: RegistroEstudianteIn, db: Session = Depends(get_db)):
    """Crea una cuenta de estudiante y devuelve el token (queda con la sesión iniciada)."""
    return AuthService(UsuarioRepository(db)).registrar_estudiante(data)


@router.post("/login-form", response_model=TokenOut, include_in_schema=False)
def login_form(form: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """Lo usa el botón 'Authorize' de /docs."""
    return AuthService(UsuarioRepository(db)).login(form.username, form.password)


@router.get("/me", response_model=UsuarioOut)
def me(user: Usuario = Depends(get_current_user)):
    return UsuarioOut(id=user.id, email=user.email, rol=user.rol.value)

@router.post("/cambiar-password", status_code=204)
def cambiar_password(data: CambiarPasswordIn, user: Usuario = Depends(get_current_user),
                     db: Session = Depends(get_db)):
    AuthService(UsuarioRepository(db)).cambiar_password(user, data.password_actual, data.password_nueva)


@router.get("/bloqueados", response_model=list[UsuarioOut])
def bloqueados(_: Usuario = Depends(require_role(Rol.COORDINADOR)), db: Session = Depends(get_db)):
    return [UsuarioOut(id=u.id, email=u.email, rol=u.rol.value)
            for u in UsuarioRepository(db).list_bloqueados()]


@router.patch("/usuarios/{usuario_id}/desbloquear", status_code=204)
def desbloquear(usuario_id: int, _: Usuario = Depends(require_role(Rol.COORDINADOR)),
                db: Session = Depends(get_db)):
    AuthService(UsuarioRepository(db)).desbloquear(usuario_id)