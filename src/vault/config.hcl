listener "tcp" {
  address          = "0.0.0.0:8200"
  tls_disable      = "true"
  #tls_cert_file    = "/vault/tls/server.crt"
  #tls_key_file     = "/vault/tls/server.key"
}

storage "file" {
  path  = "/vault/data"
}

api_addr = "https://0.0.0.0:8200"