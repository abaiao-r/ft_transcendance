#!/bin/bash

# Start Vault in the background
vault server -config=/vault/config/config.hcl -address=$VAULT_ADDR &

# Wait for Vault to start
sleep 5

# Initialize Vault and store the unseal keys and root token
vault operator init -key-shares=1 -key-threshold=1 > /vault/init_output.txt

# Extract the root token
ROOT_TOKEN=$(grep 'Initial Root Token:' /vault/init_output.txt | awk '{print $NF}')

# Print token
echo "ROOT_TOKEN:"
echo $ROOT_TOKEN

# Export the ROOT_TOKEN variable
#export ROOT_TOKEN=$ROOT_TOKEN

# Unseal Vault
vault operator unseal $(grep 'Unseal Key 1:' /vault/init_output.txt | awk '{print $NF}')

# Authenticate with the root token
vault login $ROOT_TOKEN

# Generate a static token and store it in token.txt
STATIC_TOKEN=$(vault token create -policy=default -ttl=24h -format=json | jq -r '.auth.client_token')
echo $STATIC_TOKEN > /vault/token.txt

# Enable kv secrets engine
vault secrets enable -version=2 kv

sleep 3

# Keep the script running to let Vault continue running
tail -f /dev/null