const siloTfOutput = `
Note: You didn't use the -out option to save this plan, so Terraform can't
guarantee to take exactly these actions if you run "terraform apply" now.

Terraform used the selected providers to generate the following execution
plan. Resource actions are indicated with the following symbols:
  + create

Terraform will perform the following actions:

  # azurerm_network_security_group.k3s-security-group will be created
  + resource "azurerm_network_security_group" "k3s-security-group" {
      + id                  = (known after apply)
      + location            = "canadacentral"
      + name                = "k3s-security-group-silo_9cf2ae4f-cdd0-40a6-a714-882d7a082b09"
      + resource_group_name = "Reliza-Local-Tests"
      + security_rule       = (known after apply)
      + tags                = {
          + "Name" = "RH SG - silo_9cf2ae4f-cdd0-40a6-a714-882d7a082b09"
        }
    }

  # azurerm_network_security_rule.deny-rule will be created
  + resource "azurerm_network_security_rule" "deny-rule" {
      + access                      = "Deny"
      + destination_address_prefix  = "*"
      + destination_port_range      = "*"
      + direction                   = "Inbound"
      + id                          = (known after apply)
      + name                        = "DenyAllInbound-silo_9cf2ae4f-cdd0-40a6-a714-882d7a082b09"
      + network_security_group_name = "k3s-security-group-silo_9cf2ae4f-cdd0-40a6-a714-882d7a082b09"
      + priority                    = 200
      + protocol                    = "*"
      + resource_group_name         = "Reliza-Local-Tests"
      + source_address_prefix       = "*"
      + source_port_range           = "*"
    }

  # azurerm_network_security_rule.http-rule will be created
  + resource "azurerm_network_security_rule" "http-rule" {
      + access                      = "Allow"
      + destination_address_prefix  = "*"
      + destination_port_range      = "80"
      + direction                   = "Inbound"
      + id                          = (known after apply)
      + name                        = "HTTP-silo_9cf2ae4f-cdd0-40a6-a714-882d7a082b09"
      + network_security_group_name = "k3s-security-group-silo_9cf2ae4f-cdd0-40a6-a714-882d7a082b09"
      + priority                    = 101
      + protocol                    = "Tcp"
      + resource_group_name         = "Reliza-Local-Tests"
      + source_address_prefix       = "*"
      + source_port_range           = "*"
    }

  # azurerm_network_security_rule.https-rule will be created
  + resource "azurerm_network_security_rule" "https-rule" {
      + access                      = "Allow"
      + destination_address_prefix  = "*"
      + destination_port_range      = "443"
      + direction                   = "Inbound"
      + id                          = (known after apply)
      + name                        = "HTTPS-silo_9cf2ae4f-cdd0-40a6-a714-882d7a082b09"
      + network_security_group_name = "k3s-security-group-silo_9cf2ae4f-cdd0-40a6-a714-882d7a082b09"
      + priority                    = 102
      + protocol                    = "Tcp"
      + resource_group_name         = "Reliza-Local-Tests"
      + source_address_prefix       = "*"
      + source_port_range           = "*"
    }

  # azurerm_network_security_rule.ssh-rule will be created
  + resource "azurerm_network_security_rule" "ssh-rule" {
      + access                      = "Allow"
      + destination_address_prefix  = "*"
      + destination_port_range      = "22"
      + direction                   = "Inbound"
      + id                          = (known after apply)
      + name                        = "SSH-silo_9cf2ae4f-cdd0-40a6-a714-882d7a082b09"
      + network_security_group_name = "k3s-security-group-silo_9cf2ae4f-cdd0-40a6-a714-882d7a082b09"
      + priority                    = 100
      + protocol                    = "Tcp"
      + resource_group_name         = "Reliza-Local-Tests"
      + source_address_prefix       = "*"
      + source_port_range           = "*"
    }

  # azurerm_subnet.k3s-subnet will be created
  + resource "azurerm_subnet" "k3s-subnet" {
      + address_prefixes                               = [
          + "10.5.0.0/16",
          + "fd00:db8:deca:daed::/64",
        ]
      + enforce_private_link_endpoint_network_policies = (known after apply)
      + enforce_private_link_service_network_policies  = (known after apply)
      + id                                             = (known after apply)
      + name                                           = "k3s-subnet-silo_9cf2ae4f-cdd0-40a6-a714-882d7a082b09"
    }

  # azurerm_virtual_network.k3s-vnet will be created
  + resource "azurerm_virtual_network" "k3s-vnet" {
      + address_space       = [
          + "10.5.0.0/16",
          + "fd00:db8:deca:daed::/64",
        ]
      + dns_servers         = (known after apply)
      + guid                = (known after apply)
      + id                  = (known after apply)
      + location            = "canadacentral"
      + name                = "k3s-vnet-silo_9cf2ae4f-cdd0-40a6-a714-882d7a082b09"
      + resource_group_name = "Reliza-Local-Tests"
      + subnet              = (known after apply)
      + tags                = {
          + "Name" = "RH VNet - silo_9cf2ae4f-cdd0-40a6-a714-882d7a082b09"
        }
    }

Plan: 7 to add, 0 to change, 0 to destroy.

Changes to Outputs:
  + security_group_id = (known after apply)
  + subnet_id         = (known after apply)
azurerm_virtual_network.k3s-vnet: Creating...
azurerm_network_security_group.k3s-security-group: Creating...
azurerm_network_security_group.k3s-security-group: Creation complete after 2s [id=/subscriptions/ed366fc1-5ef7-4cd3-8822-dd686d955703/resourceGroups/Reliza-Local-Tests/providers/Microsoft.Network/networkSecurityGroups/k3s-security-group-silo_9cf2ae4f-cdd0-40a6-a714-882d7a082b09]
azurerm_network_security_rule.http-rule: Creating...
azurerm_network_security_rule.ssh-rule: Creating...
azurerm_network_security_rule.deny-rule: Creating...
azurerm_network_security_rule.https-rule: Creating...
azurerm_network_security_rule.deny-rule: Creation complete after 2s [id=/subscriptions/ed366fc1-5ef7-4cd3-8822-dd686d955703/resourceGroups/Reliza-Local-Tests/providers/Microsoft.Network/networkSecurityGroups/k3s-security-group-silo_9cf2ae4f-cdd0-40a6-a714-882d7a082b09/securityRules/DenyAllInbound-silo_9cf2ae4f-cdd0-40a6-a714-882d7a082b09]
azurerm_network_security_rule.ssh-rule: Creation complete after 2s [id=/subscriptions/ed366fc1-5ef7-4cd3-8822-dd686d955703/resourceGroups/Reliza-Local-Tests/providers/Microsoft.Network/networkSecurityGroups/k3s-security-group-silo_9cf2ae4f-cdd0-40a6-a714-882d7a082b09/securityRules/SSH-silo_9cf2ae4f-cdd0-40a6-a714-882d7a082b09]
azurerm_virtual_network.k3s-vnet: Creation complete after 4s [id=/subscriptions/ed366fc1-5ef7-4cd3-8822-dd686d955703/resourceGroups/Reliza-Local-Tests/providers/Microsoft.Network/virtualNetworks/k3s-vnet-silo_9cf2ae4f-cdd0-40a6-a714-882d7a082b09]
azurerm_subnet.k3s-subnet: Creating...
azurerm_subnet.k3s-subnet: Creation complete after 5s [id=/subscriptions/ed366fc1-5ef7-4cd3-8822-dd686d955703/resourceGroups/Reliza-Local-Tests/providers/Microsoft.Network/virtualNetworks/k3s-vnet-silo_9cf2ae4f-cdd0-40a6-a714-882d7a082b09/subnets/k3s-subnet-silo_9cf2ae4f-cdd0-40a6-a714-882d7a082b09]
azurerm_network_security_rule.https-rule: Still creating... [10s elapsed]
azurerm_network_security_rule.http-rule: Still creating... [10s elapsed]
azurerm_network_security_rule.https-rule: Creation complete after 16s [id=/subscriptions/ed366fc1-5ef7-4cd3-8822-dd686d955703/resourceGroups/Reliza-Local-Tests/providers/Microsoft.Network/networkSecurityGroups/k3s-security-group-silo_9cf2ae4f-cdd0-40a6-a714-882d7a082b09/securityRules/HTTPS-silo_9cf2ae4f-cdd0-40a6-a714-882d7a082b09]
azurerm_network_security_rule.http-rule: Still creating... [20s elapsed]
azurerm_network_security_rule.http-rule: Creation complete after 29s [id=/subscriptions/ed366fc1-5ef7-4cd3-8822-dd686d955703/resourceGroups/Reliza-Local-Tests/providers/Microsoft.Network/networkSecurityGroups/k3s-security-group-silo_9cf2ae4f-cdd0-40a6-a714-882d7a082b09/securityRules/HTTP-silo_9cf2ae4f-cdd0-40a6-a714-882d7a082b09]

Apply complete! Resources: 7 added, 0 changed, 0 destroyed.

Outputs:

security_group_id = "/subscriptions/ed366fc1-5ef7-4cd3-8822-dd686d955703/resourceGroups/Reliza-Local-Tests/providers/Microsoft.Network/networkSecurityGroups/k3s-security-group-silo_9cf2ae4f-cdd0-40a6-a714-882d7a082b09"
subnet_id = "/subscriptions/ed366fc1-5ef7-4cd3-8822-dd686d955703/resourceGroups/Reliza-Local-Tests/providers/Microsoft.Network/virtualNetworks/k3s-vnet-silo_9cf2ae4f-cdd0-40a6-a714-882d7a082b09/subnets/k3s-subnet-silo_9cf2ae4f-cdd0-40a6-a714-882d7a082b09"
`

export default siloTfOutput