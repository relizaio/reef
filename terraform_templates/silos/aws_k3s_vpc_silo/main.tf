provider "aws" {}

resource "aws_vpc" "reef_vpc" {
  cidr_block = var.vpc_cidr
}

resource "aws_internet_gateway" "reef_vpc_internet_gateway" {
  vpc_id = aws_vpc.reef_vpc.id
}

# Grant the VPC internet access on its main route table
resource "aws_route" "reef_vpc_route_table" {
  route_table_id         = aws_vpc.reef_vpc.main_route_table_id
  destination_cidr_block = "0.0.0.0/0"
  gateway_id             = aws_internet_gateway.reef_vpc_internet_gateway.id
}

resource "aws_security_group" "reef_vpc_security_group" {
  name        = "REEF VPC Security Group - ${var.silo_identifier}"
  description = "Allow HTTP and HTTPS inbound traffic, all egress"
  vpc_id      = aws_vpc.reef_vpc.id

  ingress {
    # HTTPS
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  ingress {
    # HTTP
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  ingress {
    # SSH
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port       = 0
    to_port         = 0
    protocol        = "-1"
    cidr_blocks     = ["0.0.0.0/0"]
  }
}

# public subnet
resource "aws_subnet" "reef_vpc_public" {
  vpc_id            = aws_vpc.reef_vpc.id
  cidr_block        = aws_vpc.reef_vpc.cidr_block
  map_public_ip_on_launch = true
}

output "subnet_id" {
  value = aws_subnet.reef_vpc_public.id
}

output "security_group_id" {
  value = aws_security_group.reef_vpc_security_group.id
}