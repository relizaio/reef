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

resource "azurerm_virtual_network" "k3s-vnet" {
    name                = "k3s-vnet-${var.silo_identifier}"
    location            = data.azurerm_resource_group.resource-group.location
    resource_group_name = data.azurerm_resource_group.resource-group.name
    address_space       = ["10.5.0.0/16", "fd00:db8:deca:daed::/64"]
    tags = {
        Name = "RH VNet - ${var.silo_identifier}"
    }
}

resource "azurerm_subnet" "k3s-subnet" {
    name                 = "k3s-subnet-${var.silo_identifier}"
    virtual_network_name = azurerm_virtual_network.k3s-vnet.name
    resource_group_name  = data.azurerm_resource_group.resource-group.name
    address_prefixes     = ["10.5.0.0/16", "fd00:db8:deca:daed::/64"]
}

resource "azurerm_network_security_group" "k3s-security-group" {
    name                = "k3s-security-group-${var.silo_identifier}"
    location            = data.azurerm_resource_group.resource-group.location
    resource_group_name = data.azurerm_resource_group.resource-group.name
    tags = {
        Name = "RH SG - ${var.silo_identifier}"
    }
}

resource "azurerm_network_security_rule" "ssh-rule" {
    name                        = "SSH-${var.silo_identifier}"
    priority                    = 100
    direction                   = "Inbound"
    access                      = "Allow"
    protocol                    = "Tcp"
    source_port_range           = "*"
    destination_port_range      = "22"
    source_address_prefix       = "*"
    destination_address_prefix  = "*"
    resource_group_name         = data.azurerm_resource_group.resource-group.name
    network_security_group_name = azurerm_network_security_group.k3s-security-group.name
}

resource "azurerm_network_security_rule" "https-rule" {
    name                        = "HTTPS-${var.silo_identifier}"
    priority                    = 102
    direction                   = "Inbound"
    access                      = "Allow"
    protocol                    = "Tcp"
    source_port_range           = "*"
    destination_port_range      = "443"
    source_address_prefix       = "*"
    destination_address_prefix  = "*"
    resource_group_name         = data.azurerm_resource_group.resource-group.name
    network_security_group_name = azurerm_network_security_group.k3s-security-group.name
}

resource "azurerm_network_security_rule" "http-rule" {
    name                        = "HTTP-${var.silo_identifier}"
    priority                    = 101
    direction                   = "Inbound"
    access                      = "Allow"
    protocol                    = "Tcp"
    source_port_range           = "*"
    destination_port_range      = "80"
    source_address_prefix       = "*"
    destination_address_prefix  = "*"
    resource_group_name         = data.azurerm_resource_group.resource-group.name
    network_security_group_name = azurerm_network_security_group.k3s-security-group.name
}

resource "azurerm_network_security_rule" "deny-rule" {
    name                        = "DenyAllInbound-${var.silo_identifier}"
    priority                    = 200
    direction                   = "Inbound"
    access                      = "Deny"
    protocol                    = "*"
    source_port_range           = "*"
    destination_port_range      = "*"
    source_address_prefix       = "*"
    destination_address_prefix  = "*"
    resource_group_name         = data.azurerm_resource_group.resource-group.name
    network_security_group_name = azurerm_network_security_group.k3s-security-group.name
}

output "subnet_id" {
    value = azurerm_subnet.k3s-subnet.id
}

output "security_group_id" {
    value = azurerm_network_security_group.k3s-security-group.id
}

output "dns_zone_name" {
    value = data.azurerm_dns_zone.dns-zone.name
}