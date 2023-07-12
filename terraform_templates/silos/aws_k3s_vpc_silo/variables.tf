variable "silo_identifier" {
    description = "Unique Identifier to distinguish resources of this silo from others"
    default     = "non-unique"
}

variable "vpc_cidr" {
    description = "Cidr block assigned to VPC"
    default     = "10.9.0.0/16"
}