# mon-site

Application Next.js d’hommage à Jonathan, avec :
- pages éditoriales publiques,
- galerie photos/vidéos,
- articles dynamiques,
- commentaires,
- authentification Supabase,
- espace de modération administrateur.

## Documentation
- Documentation fonctionnelle : [`docs/documentation-fonctionnelle.md`](docs/documentation-fonctionnelle.md)

## Lancer le projet en local
```bash
npm install
npm run dev
```

Puis ouvrir [http://localhost:3000](http://localhost:3000).

## Variables d’environnement
Créer un `.env.local` avec au minimum :

```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
# ou NEXT_PUBLIC_SUPABASE_ANON_KEY
```
