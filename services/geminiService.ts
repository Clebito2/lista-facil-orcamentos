
import { GoogleGenAI, Type } from "@google/genai";
import { SchoolItem, SupplierQuote } from "../types";

// Fallback to process.env for broader compatibility (Vite define)
const apiKey = import.meta.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY || process.env.API_KEY;

if (!apiKey) {
  console.error("ERRO CRÍTICO: Chave da API Gemini não encontrada. Verifique VITE_GEMINI_API_KEY ou GEMINI_API_KEY no .env ou configurações do Netlify.");
}

const ai = new GoogleGenAI({ apiKey: apiKey || '' });

export const checkGeminiKey = () => {
  return {
    present: !!apiKey,
    preview: apiKey ? `${apiKey.slice(0, 4)}...${apiKey.slice(-4)}` : 'N/A',
    source: import.meta.env.VITE_GEMINI_API_KEY ? 'VITE_ENV' : (process.env.GEMINI_API_KEY ? 'PROCESS_ENV' : 'NONE')
  };
};

export interface ExtractedListResponse {
  listTitle: string;
  items: Omit<SchoolItem, 'id'>[];
}

export const extractItemsFromImage = async (base64Image: string): Promise<ExtractedListResponse> => {
  const model = "gemini-3-flash-preview";

  const response = await ai.models.generateContent({
    model,
    contents: {
      parts: [
        { inlineData: { data: base64Image, mimeType: 'image/jpeg' } },
        { text: "Extraia os itens desta lista de material escolar. Identifique também um título sugerido para a lista (ex: 'Lista 2026', 'Material 3º Ano'). Retorne um objeto JSON com 'listTitle' (string) e 'items' (array) contendo nome do item, quantidade e categoria simples. REGRA CRÍTICA PARA PAPEL/SULFITE: Se a lista pedir '500 folhas' de papel, '1 resma' ou '1 pacote de folha', a QUANTIDADE deve ser sempre 1 (UM). O nome do item deve ser 'Resma de Papel A4' ou 'Pacote 500 folhas'. NUNCA retorne quantidade 500 para papel. Para outros itens vendidos em caixa (lápis, tinta), a quantidade também é o número de CAIXAS, não de unidades soltas." }
      ]
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          listTitle: { type: Type.STRING },
          items: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                quantity: { type: Type.NUMBER },
                category: { type: Type.STRING }
              },
              required: ["name", "quantity", "category"]
            }
          }
        },
        required: ["listTitle", "items"]
      }
    }
  });

  try {
    return JSON.parse(response.text || '{"listTitle": "Lista Nova", "items": []}');
  } catch (error) {
    console.error("Erro ao parsear JSON do Gemini:", error);
    return { listTitle: "Lista Nova", items: [] };
  }
};

export const analyzeQuoteFromImage = async (base64Image: string, mimeType: string, masterListNames: string[]): Promise<Omit<SupplierQuote, 'id' | 'totalValue'>> => {
  const model = "gemini-3-flash-preview";

  const response = await ai.models.generateContent({
    model,
    contents: {
      parts: [
        { inlineData: { data: base64Image, mimeType: mimeType } }, // dynamic mimeType
        { text: `Extraia as informações deste orçamento de papelaria. Identifique o nome do fornecedor e os preços unitários de cada item. Tente associar os itens encontrados com estes nomes da lista oficial: ${masterListNames.join(", ")}. Retorne apenas um JSON puro. ATENÇÃO: Se o item for vendido em pacote/resma (ex: sulfite 500 folhas), o preço unitário deve ser do PACOTE, não da folha avulsa.` }
      ]
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          supplierName: { type: Type.STRING },
          date: { type: Type.STRING },
          items: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                itemName: { type: Type.STRING },
                unitPrice: { type: Type.NUMBER }
              },
              required: ["itemName", "unitPrice"]
            }
          }
        },
        required: ["supplierName", "items"]
      }
    }
  });

  try {
    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Erro ao parsear orçamento do Gemini:", error);
    return { supplierName: "Desconhecido", date: new Date().toISOString(), items: [] };
  }
};
