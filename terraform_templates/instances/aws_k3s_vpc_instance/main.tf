provider "aws" {}

resource "tls_private_key" "sshkey" {
  algorithm = "RSA"
  rsa_bits  = 4096
}

resource "aws_key_pair" "aws_sshkey" {
  key_name   = "SSH Key - ${var.instance_id}"
  public_key = tls_private_key.sshkey.public_key_openssh
}

resource "aws_network_interface" "ref_network_interface" {
  subnet_id   = "${var.subnet_id}"
  private_ips_count = 0
  security_groups = ["${var.security_group_id}"]
}

data "aws_ami" "ubuntu" {
  most_recent = true

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-focal-20.04-amd64-server-*"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }

  owners = ["099720109477"] # Canonical
}

resource "local_sensitive_file" "ssh_key_file" {
  filename = pathexpand("scratch/aws_sshkey_${var.instance_id}")
  file_permission = "600"
  directory_permission = "700"
  content = tls_private_key.sshkey.private_key_pem
}

resource "aws_instance" "ref_node_1" {
  ami           = data.aws_ami.ubuntu.id
  instance_type = var.instance_type
  key_name = aws_key_pair.aws_sshkey.key_name
  
  network_interface {
    network_interface_id = aws_network_interface.ref_network_interface.id
    device_index         = 0
  }
  
  root_block_device {
    volume_type = "standard"
    volume_size = 30
  }
}

data "aws_route53_zone" "dns_zone" {
  name         = var.dns_zone_name
}

resource "aws_route53_record" "www" {
  zone_id = data.aws_route53_zone.dns_zone.id
  name    = var.instance_id
  type    = "A"
  ttl     = "300"
  records = [aws_instance.ref_node_1.public_ip]
}

output "instance_ip" {
  value = aws_instance.ref_node_1.public_ip
}