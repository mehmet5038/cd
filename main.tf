 terraform {
       backend "remote" {
         
         organization = "bil481"

        
         workspaces {
           name = "bil481proje"
        }
       }
     }

  # An example resource that does nothing.
     resource "null_resource" "example" {
       triggers = {
         value = "A example resource that does nothing!"
       }
     }