import { Hero } from './Hero'
import { SplitLayout } from './SplitLayout'
import { FullScreenChat } from './FullScreenChat'
import { PreferenceForm } from './PreferenceForm'
import { FeaturedProperties } from './FeaturedProperties'
import { RichText } from './RichText'

export const blockComponents: Record<string, any> = {
  hero: Hero,
  splitLayout: SplitLayout,
  fullScreenChat: FullScreenChat,
  chatbot: FullScreenChat,
  preferenceForm: PreferenceForm,
  featuredProperties: FeaturedProperties,
  richText: RichText,
}