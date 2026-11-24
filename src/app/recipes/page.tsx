import Link from "next/link";
import Image from "next/image";

export default function RecipesPage() {
  const recipes = [
    {
      id: "chicken-biryani",
      title: "Authentic Chicken Biryani",
      time: "1h 30m",
      difficulty: "Medium",
      image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?q=80&w=600&auto=format&fit=crop",
      desc: "A rich, flavorful, and aromatic dish perfectly cooked in a heavy-bottomed Handi."
    },
    {
      id: "masala-dosa",
      title: "Crispy Masala Dosa",
      time: "45m",
      difficulty: "Hard",
      image: "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?q=80&w=600&auto=format&fit=crop",
      desc: "Golden crispy crepes made on a perfect cast-iron flat tawa for maximum heat retention."
    },
    {
      id: "paneer-butter-masala",
      title: "Paneer Butter Masala",
      time: "40m",
      difficulty: "Easy",
      image: "https://images.unsplash.com/photo-1631452180519-c014fe946bc3?q=80&w=600&auto=format&fit=crop",
      desc: "Rich and creamy tomato gravy best simmered in a Triply Stainless Steel Kadai."
    }
  ];

  return (
    <main className="container" style={{ padding: 'var(--spacing-2xl) 0', minHeight: '80vh' }}>
      <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-2xl)' }}>
        <h1 className="heading-primary">Cook with Confidence</h1>
        <p className="text-muted" style={{ maxWidth: '600px', margin: '0 auto' }}>
          Explore our curated recipes and discover the perfect cookware required to bring these authentic Indian flavors to life.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 'var(--spacing-lg)' }}>
        {recipes.map(recipe => (
          <Link href={`/recipes/${recipe.id}`} key={recipe.id} style={{ background: 'var(--card-bg)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid var(--border)', transition: 'transform 0.3s ease, box-shadow 0.3s ease' }} className="recipe-card">
            <div style={{ position: 'relative', width: '100%', height: '200px', backgroundColor: '#f3f4f6' }}>
              <Image src={recipe.image} alt={recipe.title} fill style={{ objectFit: 'cover' }} unoptimized />
            </div>
            <div style={{ padding: 'var(--spacing-lg)' }}>
              <div style={{ display: 'flex', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-sm)' }}>
                <span style={{ background: '#f3f4f6', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600, color: 'var(--muted)' }}>⏱ {recipe.time}</span>
                <span style={{ background: '#f3f4f6', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600, color: 'var(--muted)' }}>👨‍🍳 {recipe.difficulty}</span>
              </div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 'var(--spacing-xs)' }}>{recipe.title}</h2>
              <p className="text-muted" style={{ fontSize: '0.9rem', marginBottom: 'var(--spacing-lg)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{recipe.desc}</p>
              <span className="btn-secondary" style={{ width: '100%', textAlign: 'center', display: 'block' }}>View Recipe & Tools</span>
            </div>
          </Link>
        ))}
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        .recipe-card:hover {
          transform: translateY(-5px);
          box-shadow: var(--shadow-lg);
        }
      `}} />
    </main>
  );
}
