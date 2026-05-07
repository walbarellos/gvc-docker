const fs = require('fs');
let c = fs.readFileSync('frontend/src/components/pages/Visitors.tsx', 'utf8');

c = c.replace(
  'const { data, error } = await supabase.from(\'visitors\').select(\'*\').order(\'created_at\', { ascending: false });',
  'const { data, error } = await visitorService.listAll();'
);

c = c.replace(
  'const mapped = (data || []).map(d => ({',
  'const mapped = (data || []).map((d: any) => ({'
);

c = c.replace('fullName: d.full_name,', 'fullName: d.fullName || d.full_name,');
c = c.replace('isForeigner: d.is_foreigner,', 'isForeigner: d.isForeigner || d.is_foreigner,');
c = c.replace('photoUrl: d.photo_url,', 'photoUrl: d.photoUrl || d.photo_url,');
c = c.replace('createdAt: d.created_at,', 'createdAt: d.createdAt || d.created_at,');
c = c.replace('birthDate: d.birth_date,', 'birthDate: d.birthDate || d.birth_date,');

fs.writeFileSync('frontend/src/components/pages/Visitors.tsx', c);
console.log('Done!');
