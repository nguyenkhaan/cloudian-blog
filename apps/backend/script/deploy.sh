while IFS='=' read -r key value || [ -n "$key" ]; do
  # Bo qua dong trang bat dau bang # 
  [[ -z "$key" || "$key" =~ ^# ]] && continue
  
  # Remove space in the backend
  key=$(echo "$key" | xargs)
  
  if [ -n "$key" ]; then
    echo "Loading key: $key"
    echo -n "$value" | bunx wrangler secret put "$key"
  fi
done < .env