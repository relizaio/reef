variable "resource_group_name" {
    description = "Resource Group Name to use"
    default     = "unknown"
}

variable "dns_zone_name" {
    description = "DNS Zone to use"
    default     = "unknown"
}

variable "instance_id" {
    description = "Unique Ephemeral Instance ID"
    default     = "unknown"
}

variable "subnet_id" {
    description = "ID of VNet subnet"
}

variable "security_group_id" {
    description = "Security Group Id"
}

variable "instance_type" {
    description = "Type of the instance"
    default     = "Standard_D4ds_v5"
}