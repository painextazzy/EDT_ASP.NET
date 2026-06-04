// Guide d'utilisation des Skeletons dans le projet EDT_ASP.NET

## 📦 Composants Skeleton disponibles

### 1. **Skeleton.jsx** - Composant générique

Utilisé pour afficher un texte skeleton

```jsx
import Skeleton from './ui/Skeleton';

// Texte par défaut (3 lignes)
<Skeleton />

// Avec options
<Skeleton className="my-4" lines={2} />
<Skeleton type="card" />
<Skeleton type="avatar" />
```

### 2. **SkeletonTableRow.jsx** - Pour les tableaux

```jsx
import SkeletonTableRow from './ui/SkeletonTableRow';

{loading ? (
  Array.from({ length: 5 }).map((_, i) => <SkeletonTableRow key={i} columns={3} />)
) : (
  // Votre contenu normal
)}
```

### 3. **SkeletonCard.jsx** - Pour les cartes

```jsx
import SkeletonCard from './ui/SkeletonCard';

{loading ? (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
  </div>
) : (
  // Votre contenu normal
)}
```

### 4. **SkeletonLoader.jsx** - Composants pré-configurés

```jsx
import {
  TableSkeleton,
  CardGridSkeleton,
  AvatarSkeleton,
} from "./SkeletonLoader";

// Table skeleton
{
  loading && <TableSkeleton rows={5} columns={3} />;
}

// Card grid
{
  loading && <CardGridSkeleton cards={4} cols={4} />;
}

// Avatar list
{
  loading && <AvatarSkeleton count={6} />;
}
```

## ✅ Composants modifiés

### ✨ Skeletons déjà implémentés:

- ✅ **CoursPage.jsx** - Table skeleton avec 5 lignes
- ✅ **AffectationPage.jsx** - Card skeleton avec 3 sections de 4 cartes
- ✅ **DemandesPage.jsx** - Table skeleton avec 5 lignes
- ✅ **ProfesseursPage.jsx** - Avatar skeleton avec 6 cartes
- ✅ **NiveauxList.jsx** - Card skeleton avec 4 cartes
- ✅ **ParcoursList.jsx** - Card skeleton avec 4 cartes
- ✅ **Salle.jsx** - Card skeleton avec 2 sections

### 📝 Composants à ajouter les skeletons:

Pour chaque composant, ajoutez:

1. Un state `loading` avec `useState(false)`
2. Importer le skeleton approprié
3. Ajouter une condition `{loading ? <Skeleton /> : <ContenuNormal />}`

Exemples de composants à modifier:

- SauvegardePage.jsx
- DashboardHome.jsx
- BigCalendar.jsx (calendar)
- NavbarAdmin.jsx
- SidebarAdmin.jsx

## 🎨 Styling

Tous les skeletons utilisent:

- **Tailwind CSS** avec `animate-pulse`
- **Gradient**: `from-gray-200 via-gray-100 to-gray-200`
- **Responsive**: S'adaptent à tous les écrans

## 🚀 Pattern d'implémentation

```jsx
const MonComposant = () => {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Votre logique de chargement
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {loading ? (
        <SkeletonComposant />
      ) : (
        // Votre contenu normal
      )}
    </>
  );
};
```

## 📊 Types de Skeletons par cas d'usage

| Cas d'usage         | Skeleton               | Exemple              |
| ------------------- | ---------------------- | -------------------- |
| Liste de lignes     | SkeletonTableRow       | Tableaux de cours    |
| Grille de cartes    | SkeletonCard           | Affectations, Salles |
| Listes avec avatars | Skeleton type="avatar" | Professeurs          |
| Texte/Contenu       | Skeleton               | Descriptions         |
| Dashboard           | CardGridSkeleton       | Statistiques         |

---

**Dernière mise à jour**: 31/05/2026
