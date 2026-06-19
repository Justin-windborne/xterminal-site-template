import { getEntities } from '@/lib/runtime-api'
import MenuView from '@/components/site/MenuView'

export const dynamic = 'force-dynamic'

export default async function MenuPage() {
  // Two feeds per docs/MENU_ENTITY_CONTRACT.md. Both return active records sorted
  // by sort_order; the renderer groups items by `category` into `menu_section`s.
  const [sections, items] = await Promise.all([
    getEntities('menu_section'),
    getEntities('menu_item'),
  ])

  return <MenuView sections={sections} items={items} />
}
