# RDS PostgreSQL Database
# ========================

# DB Subnet Group
resource "aws_db_subnet_group" "main" {
  name_prefix = "${local.app_name}-"
  subnet_ids  = aws_subnet.private[*].id

  tags = {
    Name = "${local.app_name}-db-subnet-group"
  }

  lifecycle {
    create_before_destroy = true
  }
}

# Random password for RDS
resource "random_password" "db_password" {
  length  = 32
  special = true
}

# Store DB password in Secrets Manager
resource "aws_secretsmanager_secret" "db_password" {
  name_prefix             = "${local.app_name}-db-password-"
  recovery_window_in_days = 7

  tags = {
    Name = "${local.app_name}-db-password"
  }

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_secretsmanager_secret_version" "db_password" {
  secret_id = aws_secretsmanager_secret.db_password.id
  secret_string = jsonencode({
    username = local.db_username
    password = random_password.db_password.result
    engine   = "postgres"
    host     = aws_db_instance.main.address
    port     = aws_db_instance.main.port
    dbname   = local.db_name
  })
}

# RDS PostgreSQL Instance
resource "aws_db_instance" "main" {
  identifier     = local.app_name
  engine         = "postgres"
  engine_version = "16.4"
  instance_class = var.db_instance_class

  db_name  = local.db_name
  username = local.db_username
  password = random_password.db_password.result

  allocated_storage     = 20
  max_allocated_storage = 100
  storage_type          = "gp3"
  storage_encrypted     = true

  db_subnet_group_name   = aws_db_subnet_group.main.name
  vpc_security_group_ids = [aws_security_group.rds.id]
  publicly_accessible    = false

  backup_retention_period = var.environment == "prod" ? 7 : 1
  backup_window           = "03:00-04:00"
  maintenance_window      = "sun:04:00-sun:05:00"

  skip_final_snapshot       = var.environment != "prod"
  final_snapshot_identifier = var.environment == "prod" ? "${local.app_name}-final-${formatdate("YYYY-MM-DD-hhmm", timestamp())}" : null

  deletion_protection = var.environment == "prod"

  enabled_cloudwatch_logs_exports = ["postgresql", "upgrade"]

  tags = {
    Name = "${local.app_name}-db"
  }

  lifecycle {
    ignore_changes = [
      final_snapshot_identifier,
    ]
  }
}

# Output the DATABASE_URL for Amplify
output "database_url" {
  description = "PostgreSQL connection URL for Amplify environment variables"
  value       = "postgresql://${local.db_username}:${random_password.db_password.result}@${aws_db_instance.main.address}:${aws_db_instance.main.port}/${local.db_name}"
  sensitive   = true
}
