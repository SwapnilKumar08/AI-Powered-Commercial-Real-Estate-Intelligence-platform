terraform {
  required_version = ">= 1.7.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
  default_tags {
    tags = {
      Product     = "landmark-ai"
      Environment = var.environment
      ManagedBy   = "terraform"
    }
  }
}

variable "aws_region" {
  type    = string
  default = "eu-west-2"
}

variable "environment" {
  type    = string
  default = "development"
}

resource "aws_s3_bucket" "evidence" {
  bucket_prefix = "landmark-ai-evidence-${var.environment}-"
}

resource "aws_s3_bucket_versioning" "evidence" {
  bucket = aws_s3_bucket.evidence.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "evidence" {
  bucket = aws_s3_bucket.evidence.id
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket_public_access_block" "evidence" {
  bucket                  = aws_s3_bucket.evidence.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_ecr_repository" "services" {
  name                 = "landmark-ai-services-${var.environment}"
  image_tag_mutability = "IMMUTABLE"
  image_scanning_configuration {
    scan_on_push = true
  }
}

resource "aws_sfn_state_machine" "ingestion" {
  name     = "landmark-ai-ingestion-${var.environment}"
  role_arn = aws_iam_role.step_functions.arn
  definition = jsonencode({
    Comment = "Document provenance and extraction workflow"
    StartAt = "RecordSource"
    States = {
      RecordSource = {
        Type     = "Pass"
        Result   = { status = "source-recorded" }
        Next     = "ExtractionRequested"
      }
      ExtractionRequested = {
        Type   = "Pass"
        Result = { status = "queued" }
        End    = true
      }
    }
  })
}

resource "aws_iam_role" "step_functions" {
  name = "landmark-ai-step-functions-${var.environment}"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Principal = { Service = "states.amazonaws.com" }
      Action = "sts:AssumeRole"
    }]
  })
}

output "evidence_bucket" {
  value = aws_s3_bucket.evidence.id
}

output "service_repository" {
  value = aws_ecr_repository.services.repository_url
}

