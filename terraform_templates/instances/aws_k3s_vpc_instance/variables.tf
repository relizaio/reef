variable "instance_id" {
    description = "Unique Ephemeral Instance ID"
    default     = "unknown"
}

variable "instance_type" {
    description = "Type of the instance"
    default     = "t3a.small"
}

variable "dns_zone_id" {
    description = "route 53 zone id pre-configured for dns"
    default     = "unknown"
}

variable "subnet_id" {
    description = "ID of vpc subnet"
}

variable "security_group_id" {
    description = "ID of security group"
}