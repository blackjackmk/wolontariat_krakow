import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { getUserById } from '@/api/users';
import { getReviewsByVolunteer } from '@/api/reviews';

export default function OrganizationVolunteerShowPage() {
  const params = useParams();
  const id = Number(params.id);
  const [volunteer, setVolunteer] = useState<Uzytkownik | null>(null);
  const [reviews, setReviews] = useState<Recenzja[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [u, rs] = await Promise.all([
          getUserById(id),
          getReviewsByVolunteer(id),
        ]);
        if (!mounted) return;
        setVolunteer(u || null);
        setReviews(rs);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [id]);

  if (loading) return <div>Ładowanie profilu…</div>;
  if (!volunteer) return <div>Nie znaleziono wolontariusza</div>;

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">{volunteer.username}</h1>
            <div className="text-sm text-gray-700">E-mail: {volunteer.email}</div>
            <div className="text-sm text-gray-700">Telefon: {volunteer.nr_telefonu}</div>
            <div className="text-sm text-gray-700">Rola: {volunteer.rola}</div>
            {volunteer.rola === 'wolontariusz' && (
              <div className={`inline-flex items-center gap-2 mt-2 text-xs px-2 py-1 rounded border ${volunteer.czy_maloletni ? 'bg-yellow-50 border-yellow-300 text-yellow-700' : 'bg-emerald-50 border-emerald-300 text-emerald-700'}`}>
                Status: {volunteer.czy_maloletni ? 'Małoletni' : 'Pełnoletni'}{typeof volunteer.wiek === 'number' ? ` (${volunteer.wiek} lat)` : ''}
              </div>
            )}
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <h2 className="font-semibold mb-3">Recenzje</h2>
        {reviews.length === 0 ? (
          <div className="text-sm text-gray-600">Brak recenzji dla tego wolontariusza.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="text-left text-xs text-gray-600">
                <tr>
                  <th className="py-2 pr-4">Organizacja</th>
                  <th className="py-2 pr-4">Ocena</th>
                  <th className="py-2 pr-4">Komentarz</th>
                  <th className="py-2 pr-4">Data</th>
                </tr>
              </thead>
              <tbody>
                {reviews.map(r => (
                  <tr key={r.id} className="border-t">
                    <td className="py-2 pr-4">{r.organizacja}</td>
                    <td className="py-2 pr-4">{r.ocena} / 5</td>
                    <td className="py-2 pr-4">{r.komentarz || '-'}</td>
                    <td className="py-2 pr-4">{new Date(r.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

