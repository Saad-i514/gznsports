# GNZSPORTS — Your Day. Your Way.

A responsive clothing and accessories storefront with six collections: **Hoodies, Tracksuits, T-shirts, Fashion, Bags, and Others**.

```sh
npm install
npm run dev
npm test
npm run build
```

The first localhost visit starts an editable sample workspace with 12 fictional listings. A sample-store banner distinguishes it from live publishing. Use **Store manager → Products & collections** to replace products and **Storefront & hero editor** to change page copy and images. Samples and test orders persist in this browser only. Exiting the local draft restores the live data connection.

See [sample product guide](docs/sample-products.md) for the fields and sources used, and [admin guide](docs/admin-guide.md) for live owner activation.

The retired belt collection is excluded from the storefront, search, local carts, and management catalog. Existing remote records and historical orders were not deleted. Legacy campaign settings cannot override this clothing direction.

Live admin and order requests require the reviewed Supabase migrations and confirmed owner account. Card payments, transactional email and deployment are not configured. Never place private database credentials in browser environment variables.
