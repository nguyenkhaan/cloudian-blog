
## 1. Cloudflare Pages 

`wrangler pages deploy dist/`: Deploy dự án lên Cloudflare Pages 

`wrangler pages dev dist`: Xem trước thư mục dist (khi deploy lên thì nó sẽ như thế nào)

## 2. Cloudflare Worker 
`wrangler dev --remote` 

`wrangler dev --local` 

`wrangler d1 migrations apply database_name --remote`: Apply migration cua database tren moi truong remote (cloud)

`wrangler d1 migrations apply database_name --local` Apply migration cua database tren moi truong local 