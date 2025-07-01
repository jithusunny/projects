"""Add last_accessed to projects

Revision ID: add_last_accessed
Create Date: 2024-03-19 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'add_last_accessed'
down_revision = 'd990607d9fe8'
branch_labels = None
depends_on = None

def upgrade() -> None:
    op.add_column('projects', sa.Column('last_accessed', sa.DateTime(timezone=True), server_default=sa.text('now()')))

def downgrade() -> None:
    op.drop_column('projects', 'last_accessed') 