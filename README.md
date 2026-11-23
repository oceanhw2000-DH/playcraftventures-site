# PlayCraft Ventures website

Static copy of [playcraftventures.com](https://playcraftventures.com), served with GitHub Pages from this repository.

The site is a single-page app. A **Podcast** section for [Zero to Series](https://www.youtube.com/@zerotoseries) (hosted by Ocean Wu; formerly Beyond Seed) was added to the existing layout.

## Custom domain (GoDaddy)

Ocean will update DNS at GoDaddy. After the records below are in place, GitHub Pages can serve the site at `playcraftventures.com`.

Apex (`@`) A records:

- `185.199.108.153`
- `185.199.109.153`
- `185.199.110.153`
- `185.199.111.153`

Optional IPv6 AAAA records for the apex:

- `2606:50c0:8000::153`
- `2606:50c0:8001::153`
- `2606:50c0:8002::153`
- `2606:50c0:8003::153`

`www` CNAME record:

- `www` → `oceanhw2000-dh.github.io`

These values are from [GitHub's custom domain docs](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site). Until DNS is updated, the site is also available at `https://oceanhw2000-dh.github.io/playcraftventures-site/`.
