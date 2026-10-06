<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Catalog architecture
- Public catalog reads use anonymous publishable-key server functions with safe vehicle/photo projections and slug-scoped ownership; this keeps private fields out of HTML and social metadata.
- The catalog index is a leaf below a pure Outlet layout; vehicle detail metadata must not inherit the catalog cover image.
- Owner preview reuses the public catalog view with unsaved local draft data; drafts never require public-read access or anonymous publication.
- Catalog visibility/order stay on existing vehicles, not a duplicate fleet/settings table; each account already has one site.
- Generate sharing QR codes locally with qrcode; this avoids a third-party dependency and exposes no link to an image service.
