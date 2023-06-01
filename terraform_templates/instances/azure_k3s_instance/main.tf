terraform {
    required_providers {
        azurerm = {
            source  = "hashicorp/azurerm"
            version = "=3.39.1"
        }
    }

}

provider "azurerm" {
    features {}
}

data "azurerm_resource_group" "resource-group" {
    name = var.resource_group_name
}

data "azurerm_dns_zone" "dns-zone" {
  name                = var.dns_zone_name
  resource_group_name = data.azurerm_resource_group.resource-group.name
}

resource "azurerm_public_ip" "k3s-publicip" {
    name                = "k3s-publicip-${var.instance_id}"
    resource_group_name = data.azurerm_resource_group.resource-group.name
    location            = data.azurerm_resource_group.resource-group.location
    allocation_method   = "Static"
    sku                 = "Standard"
    ip_version = "IPv6"
}

resource "azurerm_public_ip" "k3s-publicipv4" {
    name                = "k3s-publicipv4-${var.instance_id}"
    resource_group_name = data.azurerm_resource_group.resource-group.name
    location            = data.azurerm_resource_group.resource-group.location
    allocation_method   = "Static"
    sku                 = "Standard"
    ip_version = "IPv4"
}

resource "azurerm_dns_a_record" "arecord" {
  name                = var.instance_id
  zone_name           = data.azurerm_dns_zone.dns-zone.name
  resource_group_name = data.azurerm_resource_group.resource-group.name
  ttl                 = 300
  records             = [azurerm_public_ip.k3s-publicipv4.ip_address]
}

resource "azurerm_network_interface" "k3s-network-interface" {
    name                = "k3s-network-interface-${var.instance_id}"
    resource_group_name = data.azurerm_resource_group.resource-group.name
    location            = data.azurerm_resource_group.resource-group.location

    ip_configuration {
        name                          = "k3s-ip-v4-${var.instance_id}"
        subnet_id                     = "${var.subnet_id}"
        private_ip_address_allocation = "Dynamic"
        primary                       = "true"
        public_ip_address_id          = azurerm_public_ip.k3s-publicipv4.id
    }
    
    ip_configuration {
        name                          = "k3s-ip-v6-${var.instance_id}"
        private_ip_address_allocation = "Dynamic"
        private_ip_address_version    = "IPv6"
        subnet_id                     = "${var.subnet_id}"
        public_ip_address_id          = azurerm_public_ip.k3s-publicip.id
    }
}

resource "azurerm_network_interface_security_group_association" "k3s-sg-association" {
    network_interface_id      = azurerm_network_interface.k3s-network-interface.id
    network_security_group_id = "${var.security_group_id}"
}

resource "tls_private_key" "sshkey" {
  algorithm = "RSA"
  rsa_bits  = 4096
}

resource "local_sensitive_file" "ssh_key_file" {
  filename = pathexpand("scratch/aws_sshkey_${var.instance_id}")
  file_permission = "600"
  directory_permission = "700"
  content = tls_private_key.sshkey.private_key_pem
}

resource "azurerm_linux_virtual_machine" "k3s-ephemeral" {
    name                  = "k3s-ephemeral-${var.instance_id}"
    location              = data.azurerm_resource_group.resource-group.location
    resource_group_name   = data.azurerm_resource_group.resource-group.name
    network_interface_ids = [azurerm_network_interface.k3s-network-interface.id]
    size                  = "${var.instance_type}" # TODO must be configured outside

    os_disk {
        name                 =  "k3s-disk-${var.instance_id}"
        caching              =  "ReadWrite"
        storage_account_type =  "Standard_LRS"
        disk_size_gb         =  "250"
    }

    source_image_reference {
        publisher = "canonical"
        offer     = "0001-com-ubuntu-server-jammy"
        sku       = "22_04-lts"
        version   = "latest"
    }

    computer_name                   = "k3s-azure-${var.instance_id}"
    admin_username                  = "ubuntu"
    disable_password_authentication = true

    admin_ssh_key {
        username   = "ubuntu"
        public_key = tls_private_key.sshkey.public_key_openssh
    }

    tags = {
        Name = "RH VNet - ${var.instance_id}"
    }
}

output "instance_ip" {
    value = azurerm_public_ip.k3s-publicipv4.ip_address
}

output "fqdn" {
    value = "${var.instance_id}.${var.dns_zone_name}"
}