variable "resource_group_name" {
    description = "Resource Group Name to use"
    default     = "unknown"
}

variable "silo_identifier" {
    description = "Unique Identifier to distinguish resources of this silo from others"
    default     = "non-unique"
}

variable "dns_zone_name" {
    description = "DNS zone to use"
    default     = "localtests.relizahub.com"
}