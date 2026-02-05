from sqlalchemy import Column, Integer, String, DateTime, ARRAY, Float, Boolean
from sqlalchemy.sql import func
from database import Base
import uuid

class Face(Base):
    __tablename__ = "faces"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    external_id = Column(String, unique=True, index=True, nullable=False) # ID from Auth Service (User/Admin ID)
    type = Column(String, nullable=False) # 'USER' or 'ADMIN'
    embedding = Column(ARRAY(Float), nullable=False) # Face Vector (512 dims)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    def to_dict(self):
        return {
            "id": self.id,
            "external_id": self.external_id,
            "type": self.type,
            "created_at": self.created_at
        }
