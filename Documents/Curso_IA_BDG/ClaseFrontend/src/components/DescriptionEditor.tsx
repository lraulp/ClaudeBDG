import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import MarkdownPreview from './MarkdownPreview'

interface Props {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export default function DescriptionEditor({ value, onChange, placeholder }: Props) {
  return (
    <Tabs defaultValue="escribir">
      <TabsList>
        <TabsTrigger value="escribir">Escribir</TabsTrigger>
        <TabsTrigger value="preview">Vista previa</TabsTrigger>
      </TabsList>
      <TabsContent value="escribir">
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder ?? 'Soporta **Markdown**'}
          className="min-h-32 resize-none"
        />
      </TabsContent>
      <TabsContent value="preview">
        {value ? (
          <MarkdownPreview content={value} className="min-h-32 border rounded-md p-3" />
        ) : (
          <p className="text-sm text-gray-400 p-3">Sin contenido</p>
        )}
      </TabsContent>
    </Tabs>
  )
}
