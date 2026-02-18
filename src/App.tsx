import { useState } from 'react';
import html2pdf from 'html2pdf.js';
import { BookOpen, CheckCircle2, Copy, Download, ExternalLink, Link2, Loader2, Sparkles, X } from 'lucide-react';

const GOOGLE_SCRIPT_URL = import.meta.env.VITE_GOOGLE_SCRIPT_URL || '';
const usuarios = ['La Vida es Maravillosa', 'Jardín de las Delicias'] as const;

type Channel = {
  name: string;
  medium: string;
  sources: { label: string; value: string }[];
  customSource?: boolean;
  sourcePrefix?: string;
  customLabel?: string;
  customPlaceholder?: string;
};

const channels: Record<string, Channel> = {
  'SEO orgánico (no pagado)': {
    name: 'SEO orgánico (no pagado)',
    medium: 'organic',
    sources: [
      { label: 'Google', value: 'google' },
      { label: 'Bing', value: 'bing' },
    ],
  },
  'Redes sociales orgánicas': {
    name: 'Redes sociales orgánicas',
    medium: 'social',
    sources: [
      { label: 'Facebook', value: 'facebook' },
      { label: 'Instagram', value: 'instagram' },
      { label: 'TikTok', value: 'tiktok' },
      { label: 'LinkedIn', value: 'linkedin' },
      { label: 'Twitter', value: 'twitter' },
    ],
  },
  'Newsletter / Email marketing': {
    name: 'Newsletter / Email marketing',
    medium: 'email',
    sources: [{ label: 'Newsletter', value: 'newsletter' }],
  },
  'Afiliados / Partners': {
    name: 'Afiliados / Partners',
    medium: 'affiliate',
    sources: [],
    customSource: true,
    customLabel: 'Nombre del partner',
    customPlaceholder: 'Ej: NombrePartner',
  },
  'Influencers': {
    name: 'Influencers',
    medium: 'influencer',
    sources: [],
    customSource: true,
    sourcePrefix: 'influencer_',
    customLabel: 'Nombre del influencer',
    customPlaceholder: 'Ej: Ana López',
  },
  'Paid Search (SEM)': {
    name: 'Paid Search (SEM)',
    medium: 'cpc',
    sources: [{ label: 'Google', value: 'google' }],
  },
  'Paid Social': {
    name: 'Paid Social',
    medium: 'paid_social',
    sources: [{ label: 'Meta (dinámico)', value: '{{site_source_name}}' }],
  },
  'Referral (externo)': {
    name: 'Referral (externo)',
    medium: 'referral',
    sources: [],
    customSource: true,
    customLabel: 'Nombre del sitio externo',
    customPlaceholder: 'Ej: blogejemplo o sitioexterno',
  },
};

const cities = ['Madrid', 'Sevilla', 'Valencia', 'Marbella'];
const aliases = ['Registros', 'Venta Oficial', 'Primer Avance', 'Segundo Avance', 'Full Line Up'] as const;

const toBase64 = (url: string): Promise<string> =>
  new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      canvas.getContext('2d')!.drawImage(img, 0, 0);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = () => resolve('');
    img.src = url;
  });

function App() {
  const [baseUrl, setBaseUrl] = useState('');
  const [city, setCity] = useState('Madrid');
  const [channel, setChannel] = useState('SEO orgánico (no pagado)');
  const [selectedSource, setSelectedSource] = useState('google');
  const [customSourceName, setCustomSourceName] = useState('');
  const [utmContent, setUtmContent] = useState('');
  const [alias, setAlias] = useState<typeof aliases[number]>('Registros');
  const [usuario, setUsuario] = useState<typeof usuarios[number]>('La Vida es Maravillosa');
  const [copied, setCopied] = useState(false);
  const [showManual, setShowManual] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState('');

  const normalize = (text: string) =>
    text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_|_$/g, '');

  const selectedChannel = channels[channel];
  const utmCampaign = `jardin_delicias_${normalize(city)}_2026`;

  const getSource = () => {
    if (selectedChannel.customSource && customSourceName) {
      const prefix = selectedChannel.sourcePrefix || '';
      return `${prefix}${normalize(customSourceName)}`;
    }
    return selectedSource;
  };

  const isValidUrl = (input: string): boolean => {
    try {
      const url = new URL(input.startsWith('http') ? input : `https://${input}`);
      return /\.(com|es)$/i.test(url.hostname);
    } catch {
      return false;
    }
  };

  const generateFinalUrl = () => {
    if (!baseUrl || !isValidUrl(baseUrl)) return '';

    const url = new URL(baseUrl.startsWith('http') ? baseUrl : `https://${baseUrl}`);
    const source = getSource();

    url.searchParams.set('utm_source', source);
    url.searchParams.set('utm_medium', selectedChannel.medium);
    url.searchParams.set('utm_campaign', utmCampaign);

    if (utmContent) {
      url.searchParams.set('utm_content', normalize(utmContent));
    }

    return url.toString();
  };

  const finalUrl = generateFinalUrl();

  const handleDownloadManual = async () => {
    const [lvmB64, jdldB64] = await Promise.all([
      toBase64('/images/lvm.png'),
      toBase64('/images/z JDLD 1.91_1_Logo JDLD25.jpg'),
    ]);

    const container = document.createElement('div');
    container.innerHTML = `
<div style="font-family: 'Segoe UI', system-ui, sans-serif; color: #1a1a2e; line-height: 1.7; padding: 20px;">

<div style="background: #f0f0f0; border-radius: 12px; padding: 20px; margin-bottom: 24px; display: flex; align-items: center; justify-content: center; gap: 40px;">
  ${lvmB64 ? `<div style="background: #1A1A2E; border-radius: 10px; padding: 12px 20px; display: flex; align-items: center; justify-content: center;"><img src="${lvmB64}" style="height: 50px;" /></div>` : ''}
  ${jdldB64 ? `<img src="${jdldB64}" style="height: 70px; border-radius: 8px;" />` : ''}
</div>

<h1 style="font-size: 24px; color: #E91E8C; margin-bottom: 6px; text-align: center;">NeXe - UTM Generator</h1>
<p style="color: #666; font-size: 13px; margin-bottom: 20px; text-align: center;">Jardín de las Delicias Festival 2026 — Manual de uso</p>

<h2 style="font-size: 17px; color: #0F3460; margin-top: 24px; margin-bottom: 10px; border-bottom: 2px solid #E91E8C; padding-bottom: 4px;">1. ¿Qué son las UTMs?</h2>
<p style="font-size: 13px; margin-bottom: 10px;">Las UTMs (Urchin Tracking Module) son parámetros que se añaden a una URL para rastrear el origen del tráfico en herramientas de analítica como Google Analytics. Permiten saber exactamente de qué campaña, canal y contenido proviene cada visita.</p>

<h2 style="font-size: 17px; color: #0F3460; margin-top: 24px; margin-bottom: 10px; border-bottom: 2px solid #E91E8C; padding-bottom: 4px;">2. Parámetros UTM utilizados</h2>
<table style="width: 100%; border-collapse: collapse; margin: 12px 0; font-size: 12px;">
  <tr><th style="background: #0F3460; color: white; text-align: left; padding: 8px 10px;">Parámetro</th><th style="background: #0F3460; color: white; text-align: left; padding: 8px 10px;">Descripción</th><th style="background: #0F3460; color: white; text-align: left; padding: 8px 10px;">Ejemplo</th></tr>
  <tr><td style="padding: 8px 10px; border-bottom: 1px solid #e0e0e0;"><code style="color: #E91E8C;">utm_source</code></td><td style="padding: 8px 10px; border-bottom: 1px solid #e0e0e0;">Origen del tráfico</td><td style="padding: 8px 10px; border-bottom: 1px solid #e0e0e0;">google, tiktok, influencer_ana</td></tr>
  <tr><td style="padding: 8px 10px; border-bottom: 1px solid #e0e0e0; background: #f8f8fc;"><code style="color: #E91E8C;">utm_medium</code></td><td style="padding: 8px 10px; border-bottom: 1px solid #e0e0e0; background: #f8f8fc;">Tipo de canal o medio</td><td style="padding: 8px 10px; border-bottom: 1px solid #e0e0e0; background: #f8f8fc;">cpc, paid_social, email</td></tr>
  <tr><td style="padding: 8px 10px; border-bottom: 1px solid #e0e0e0;"><code style="color: #E91E8C;">utm_campaign</code></td><td style="padding: 8px 10px; border-bottom: 1px solid #e0e0e0;">Nombre de la campaña (auto)</td><td style="padding: 8px 10px; border-bottom: 1px solid #e0e0e0;">jardin_delicias_madrid_2026</td></tr>
  <tr><td style="padding: 8px 10px; border-bottom: 1px solid #e0e0e0; background: #f8f8fc;"><code style="color: #E91E8C;">utm_content</code></td><td style="padding: 8px 10px; border-bottom: 1px solid #e0e0e0; background: #f8f8fc;">Promoción (opcional)</td><td style="padding: 8px 10px; border-bottom: 1px solid #e0e0e0; background: #f8f8fc;">black_friday, lanzamiento</td></tr>
</table>

<h2 style="font-size: 17px; color: #0F3460; margin-top: 24px; margin-bottom: 10px; border-bottom: 2px solid #E91E8C; padding-bottom: 4px;">3. Canales disponibles</h2>
<table style="width: 100%; border-collapse: collapse; margin: 12px 0; font-size: 12px;">
  <tr><th style="background: #0F3460; color: white; text-align: left; padding: 8px 10px;">Canal</th><th style="background: #0F3460; color: white; text-align: left; padding: 8px 10px;">utm_source</th><th style="background: #0F3460; color: white; text-align: left; padding: 8px 10px;">utm_medium</th></tr>
  <tr><td style="padding: 8px 10px; border-bottom: 1px solid #e0e0e0;">SEO orgánico (no pagado)</td><td style="padding: 8px 10px; border-bottom: 1px solid #e0e0e0;"><code style="color: #E91E8C;">google</code></td><td style="padding: 8px 10px; border-bottom: 1px solid #e0e0e0;">organic</td></tr>
  <tr><td style="padding: 8px 10px; border-bottom: 1px solid #e0e0e0; background: #f8f8fc;">SEO orgánico (no pagado)</td><td style="padding: 8px 10px; border-bottom: 1px solid #e0e0e0; background: #f8f8fc;"><code style="color: #E91E8C;">bing</code></td><td style="padding: 8px 10px; border-bottom: 1px solid #e0e0e0; background: #f8f8fc;">organic</td></tr>
  <tr><td style="padding: 8px 10px; border-bottom: 1px solid #e0e0e0;">Redes sociales orgánicas</td><td style="padding: 8px 10px; border-bottom: 1px solid #e0e0e0;"><code style="color: #E91E8C;">facebook</code></td><td style="padding: 8px 10px; border-bottom: 1px solid #e0e0e0;">social</td></tr>
  <tr><td style="padding: 8px 10px; border-bottom: 1px solid #e0e0e0; background: #f8f8fc;">Redes sociales orgánicas</td><td style="padding: 8px 10px; border-bottom: 1px solid #e0e0e0; background: #f8f8fc;"><code style="color: #E91E8C;">instagram</code></td><td style="padding: 8px 10px; border-bottom: 1px solid #e0e0e0; background: #f8f8fc;">social</td></tr>
  <tr><td style="padding: 8px 10px; border-bottom: 1px solid #e0e0e0;">Redes sociales orgánicas</td><td style="padding: 8px 10px; border-bottom: 1px solid #e0e0e0;"><code style="color: #E91E8C;">tiktok</code></td><td style="padding: 8px 10px; border-bottom: 1px solid #e0e0e0;">social</td></tr>
  <tr><td style="padding: 8px 10px; border-bottom: 1px solid #e0e0e0; background: #f8f8fc;">Redes sociales orgánicas</td><td style="padding: 8px 10px; border-bottom: 1px solid #e0e0e0; background: #f8f8fc;"><code style="color: #E91E8C;">linkedin</code></td><td style="padding: 8px 10px; border-bottom: 1px solid #e0e0e0; background: #f8f8fc;">social</td></tr>
  <tr><td style="padding: 8px 10px; border-bottom: 1px solid #e0e0e0;">Redes sociales orgánicas</td><td style="padding: 8px 10px; border-bottom: 1px solid #e0e0e0;"><code style="color: #E91E8C;">twitter</code></td><td style="padding: 8px 10px; border-bottom: 1px solid #e0e0e0;">social</td></tr>
  <tr><td style="padding: 8px 10px; border-bottom: 1px solid #e0e0e0; background: #f8f8fc;">Newsletter / Email marketing</td><td style="padding: 8px 10px; border-bottom: 1px solid #e0e0e0; background: #f8f8fc;"><code style="color: #E91E8C;">newsletter</code></td><td style="padding: 8px 10px; border-bottom: 1px solid #e0e0e0; background: #f8f8fc;">email</td></tr>
  <tr><td style="padding: 8px 10px; border-bottom: 1px solid #e0e0e0;">Afiliados / Partners</td><td style="padding: 8px 10px; border-bottom: 1px solid #e0e0e0;"><code style="color: #E91E8C;">partnername</code></td><td style="padding: 8px 10px; border-bottom: 1px solid #e0e0e0;">affiliate</td></tr>
  <tr><td style="padding: 8px 10px; border-bottom: 1px solid #e0e0e0; background: #f8f8fc;">Influencers</td><td style="padding: 8px 10px; border-bottom: 1px solid #e0e0e0; background: #f8f8fc;"><code style="color: #E91E8C;">influencer_{nombre}</code></td><td style="padding: 8px 10px; border-bottom: 1px solid #e0e0e0; background: #f8f8fc;">influencer</td></tr>
  <tr><td style="padding: 8px 10px; border-bottom: 1px solid #e0e0e0;">Paid Search (SEM)</td><td style="padding: 8px 10px; border-bottom: 1px solid #e0e0e0;"><code style="color: #E91E8C;">google</code></td><td style="padding: 8px 10px; border-bottom: 1px solid #e0e0e0;">cpc</td></tr>
  <tr><td style="padding: 8px 10px; border-bottom: 1px solid #e0e0e0; background: #f8f8fc;">Paid Social</td><td style="padding: 8px 10px; border-bottom: 1px solid #e0e0e0; background: #f8f8fc;"><code style="color: #E91E8C;">{{site_source_name}}</code></td><td style="padding: 8px 10px; border-bottom: 1px solid #e0e0e0; background: #f8f8fc;">paid_social</td></tr>
  <tr><td style="padding: 8px 10px; border-bottom: 1px solid #e0e0e0;">Referral (externo)</td><td style="padding: 8px 10px; border-bottom: 1px solid #e0e0e0;"><code style="color: #E91E8C;">blogexterno / sitioexterno</code></td><td style="padding: 8px 10px; border-bottom: 1px solid #e0e0e0;">referral</td></tr>
</table>

<h2 style="font-size: 17px; color: #0F3460; margin-top: 24px; margin-bottom: 10px; border-bottom: 2px solid #E91E8C; padding-bottom: 4px;">4. Ciudades</h2>
<p style="font-size: 13px; margin-bottom: 10px;">Las campañas están segmentadas por ciudad: <strong>Madrid</strong> · <strong>Sevilla</strong> · <strong>Valencia</strong> · <strong>Marbella</strong></p>
<p style="font-size: 13px; margin-bottom: 10px;">Formato automático: <code style="color: #E91E8C;">jardin_delicias_{ciudad}_2026</code></p>

<h2 style="font-size: 17px; color: #0F3460; margin-top: 24px; margin-bottom: 10px; border-bottom: 2px solid #E91E8C; padding-bottom: 4px;">5. Campo Alias</h2>
<p style="font-size: 13px; margin-bottom: 10px;">El <strong>Alias</strong> identifica la fase o tipo de comunicación del enlace generado. Se registra junto al resto de datos en Google Sheets para facilitar el seguimiento.</p>
<table style="width: 100%; border-collapse: collapse; margin: 12px 0; font-size: 12px;">
  <tr><th style="background: #0F3460; color: white; text-align: left; padding: 8px 10px;">Alias</th><th style="background: #0F3460; color: white; text-align: left; padding: 8px 10px;">Cuándo usarlo</th></tr>
  <tr><td style="padding: 8px 10px; border-bottom: 1px solid #e0e0e0; font-weight: bold;">Registros</td><td style="padding: 8px 10px; border-bottom: 1px solid #e0e0e0;">Fase de recogida de registros / pre-inscripción</td></tr>
  <tr><td style="padding: 8px 10px; border-bottom: 1px solid #e0e0e0; background: #f8f8fc; font-weight: bold;">Venta Oficial</td><td style="padding: 8px 10px; border-bottom: 1px solid #e0e0e0; background: #f8f8fc;">Apertura oficial de venta de entradas</td></tr>
  <tr><td style="padding: 8px 10px; border-bottom: 1px solid #e0e0e0; font-weight: bold;">Primer Avance</td><td style="padding: 8px 10px; border-bottom: 1px solid #e0e0e0;">Primera comunicación de artistas o contenido</td></tr>
  <tr><td style="padding: 8px 10px; border-bottom: 1px solid #e0e0e0; background: #f8f8fc; font-weight: bold;">Segundo Avance</td><td style="padding: 8px 10px; border-bottom: 1px solid #e0e0e0; background: #f8f8fc;">Segunda comunicación de artistas o contenido</td></tr>
  <tr><td style="padding: 8px 10px; font-weight: bold;">Full Line Up</td><td style="padding: 8px 10px;">Revelación completa del cartel</td></tr>
</table>

<h2 style="font-size: 17px; color: #0F3460; margin-top: 24px; margin-bottom: 10px; border-bottom: 2px solid #E91E8C; padding-bottom: 4px;">6. Registros históricos</h2>
<p style="font-size: 13px; margin-bottom: 10px;">Cada URL copiada queda registrada automáticamente en Google Sheets con todos sus parámetros. Puedes consultar el historial completo desde el botón <strong>"Ver registros históricos"</strong> en la pantalla principal.</p>
<div style="background: #FFF8E1; border-left: 4px solid #F5C518; padding: 10px 12px; margin: 10px 0; font-size: 12px; border-radius: 0 6px 6px 0;">
  Los campos registrados son: <strong>Timestamp · Usuario · Alias · URL Base · Ciudad · Canal · utm_source · utm_medium · utm_campaign · utm_content · URL Final</strong>
</div>

<h2 style="font-size: 17px; color: #0F3460; margin-top: 24px; margin-bottom: 10px; border-bottom: 2px solid #E91E8C; padding-bottom: 4px;">7. Guía visual paso a paso</h2>

<div style="background: #f8f8fc; border: 1px solid #e0e0e0; border-radius: 10px; padding: 14px; margin-bottom: 6px;">
  <div style="display: flex; align-items: flex-start; gap: 10px; margin-bottom: 8px;">
    <span style="display: inline-flex; align-items: center; justify-content: center; width: 24px; height: 24px; border-radius: 50%; background: #E91E8C; color: white; font-size: 12px; font-weight: bold; flex-shrink: 0;">1</span>
    <div style="font-size: 13px;"><strong>Introduce la URL base</strong> <span style="color: #888;">— Debe terminar en .com o .es.</span></div>
  </div>
  <div style="margin-left: 34px; background: white; border: 1px solid #ccc; border-radius: 6px; padding: 6px 10px; font-size: 11px; color: #999; font-family: monospace;">https://entradas.jardindelasdelicias.com</div>
</div>
<div style="text-align: center; color: #ccc; font-size: 16px; line-height: 1;">↓</div>

<div style="background: #f8f8fc; border: 1px solid #e0e0e0; border-radius: 10px; padding: 14px; margin-bottom: 6px;">
  <div style="display: flex; align-items: flex-start; gap: 10px; margin-bottom: 8px;">
    <span style="display: inline-flex; align-items: center; justify-content: center; width: 24px; height: 24px; border-radius: 50%; background: #E91E8C; color: white; font-size: 12px; font-weight: bold; flex-shrink: 0;">2</span>
    <div style="font-size: 13px;"><strong>Selecciona el Alias</strong> <span style="color: #888;">— La fase de la campaña.</span></div>
  </div>
  <div style="margin-left: 34px; background: white; border: 1px solid #ccc; border-radius: 6px; padding: 6px 10px; font-size: 11px; color: #555;">Venta Oficial ▼</div>
</div>
<div style="text-align: center; color: #ccc; font-size: 16px; line-height: 1;">↓</div>

<div style="background: #f8f8fc; border: 1px solid #e0e0e0; border-radius: 10px; padding: 14px; margin-bottom: 6px;">
  <div style="display: flex; align-items: flex-start; gap: 10px; margin-bottom: 8px;">
    <span style="display: inline-flex; align-items: center; justify-content: center; width: 24px; height: 24px; border-radius: 50%; background: #E91E8C; color: white; font-size: 12px; font-weight: bold; flex-shrink: 0;">3</span>
    <div style="font-size: 13px;"><strong>Selecciona usuario y ciudad</strong> <span style="color: #888;">— Quién genera y la ciudad de campaña.</span></div>
  </div>
  <div style="margin-left: 34px; display: flex; gap: 8px;">
    <div style="flex: 1; background: white; border: 1px solid #ccc; border-radius: 6px; padding: 6px 10px; font-size: 11px; color: #555;">La Vida es Maravillosa ▼</div>
    <div style="flex: 1; background: white; border: 1px solid #ccc; border-radius: 6px; padding: 6px 10px; font-size: 11px; color: #555;">Madrid ▼</div>
  </div>
</div>
<div style="text-align: center; color: #ccc; font-size: 16px; line-height: 1;">↓</div>

<div style="background: #f8f8fc; border: 1px solid #e0e0e0; border-radius: 10px; padding: 14px; margin-bottom: 6px;">
  <div style="display: flex; align-items: flex-start; gap: 10px; margin-bottom: 8px;">
    <span style="display: inline-flex; align-items: center; justify-content: center; width: 24px; height: 24px; border-radius: 50%; background: #E91E8C; color: white; font-size: 12px; font-weight: bold; flex-shrink: 0;">4</span>
    <div style="font-size: 13px;"><strong>Selecciona canal y fuente</strong> <span style="color: #888;">— El canal y la fuente concreta.</span></div>
  </div>
  <div style="margin-left: 34px; display: flex; gap: 8px;">
    <div style="flex: 1; background: white; border: 1px solid #ccc; border-radius: 6px; padding: 6px 10px; font-size: 11px; color: #555;">Redes sociales orgánicas ▼</div>
    <div style="flex: 1; background: white; border: 1px solid #00B4C5; border-radius: 6px; padding: 6px 10px; font-size: 11px; color: #009AA8;">Instagram ▼</div>
  </div>
  <div style="margin-left: 34px; margin-top: 6px; font-size: 10px; color: #aaa; font-style: italic;">* Para Influencers / Afiliados / Referral aparece un campo de texto libre.</div>
</div>
<div style="text-align: center; color: #ccc; font-size: 16px; line-height: 1;">↓</div>

<div style="background: #f8f8fc; border: 1px solid #e0e0e0; border-radius: 10px; padding: 14px; margin-bottom: 6px;">
  <div style="display: flex; align-items: flex-start; gap: 10px; margin-bottom: 8px;">
    <span style="display: inline-flex; align-items: center; justify-content: center; width: 24px; height: 24px; border-radius: 50%; background: #E91E8C; color: white; font-size: 12px; font-weight: bold; flex-shrink: 0;">5</span>
    <div style="font-size: 13px;"><strong>Promoción (opcional)</strong> <span style="color: #888;">— Si el enlace va asociado a una promo.</span></div>
  </div>
  <div style="margin-left: 34px; background: white; border: 1px solid #ccc; border-radius: 6px; padding: 6px 10px; font-size: 11px; color: #999; font-family: monospace;">black_friday</div>
</div>
<div style="text-align: center; color: #ccc; font-size: 16px; line-height: 1;">↓</div>

<div style="background: #f8f8fc; border: 1px solid #e0e0e0; border-radius: 10px; padding: 14px; margin-bottom: 6px;">
  <div style="display: flex; align-items: flex-start; gap: 10px; margin-bottom: 8px;">
    <span style="display: inline-flex; align-items: center; justify-content: center; width: 24px; height: 24px; border-radius: 50%; background: #E91E8C; color: white; font-size: 12px; font-weight: bold; flex-shrink: 0;">6</span>
    <div style="font-size: 13px;"><strong>Revisa y copia la URL</strong> <span style="color: #888;">— Verifica los parámetros y copia. Se guarda automáticamente en Sheets.</span></div>
  </div>
  <div style="margin-left: 34px;">
    <div style="background: white; border: 1px solid #e0e0e0; border-radius: 6px; padding: 8px 10px; font-size: 10px; font-family: monospace; margin-bottom: 6px;">
      <div style="display: flex; gap: 6px;"><span style="color: #999; width: 75px;">utm_source</span><span style="color: #009AA8;">instagram</span></div>
      <div style="display: flex; gap: 6px;"><span style="color: #999; width: 75px;">utm_medium</span><span style="color: #009AA8;">social</span></div>
      <div style="display: flex; gap: 6px;"><span style="color: #999; width: 75px;">utm_campaign</span><span style="color: #009AA8;">jardin_delicias_madrid_2026</span></div>
      <div style="display: flex; gap: 6px;"><span style="color: #999; width: 75px;">utm_content</span><span style="color: #009AA8;">black_friday</span></div>
    </div>
    <div style="background: linear-gradient(to right, #E91E8C, #C4177A); color: white; text-align: center; font-size: 12px; font-weight: bold; padding: 8px; border-radius: 6px;">Copiar URL</div>
  </div>
</div>

<h2 style="font-size: 17px; color: #0F3460; margin-top: 24px; margin-bottom: 10px; border-bottom: 2px solid #E91E8C; padding-bottom: 4px;">8. Ejemplos prácticos</h2>

<div style="background: #f8f8fc; border-left: 4px solid #00B4C5; padding: 12px; margin: 12px 0; font-size: 12px;">
  <strong>Paid Social en Madrid</strong><br/>
  <code style="word-break: break-all; color: #E91E8C;">https://entradas.jardin.com?utm_source={{site_source_name}}&amp;utm_medium=paid_social&amp;utm_campaign=jardin_delicias_madrid_2026</code>
</div>

<div style="background: #f8f8fc; border-left: 4px solid #00B4C5; padding: 12px; margin: 12px 0; font-size: 12px;">
  <strong>Redes sociales orgánicas (Instagram) en Valencia</strong><br/>
  <code style="word-break: break-all; color: #E91E8C;">https://entradas.jardin.com?utm_source=instagram&amp;utm_medium=social&amp;utm_campaign=jardin_delicias_valencia_2026</code>
</div>

<div style="background: #f8f8fc; border-left: 4px solid #00B4C5; padding: 12px; margin: 12px 0; font-size: 12px;">
  <strong>Influencer "Ana López" en Sevilla + Black Friday</strong><br/>
  <code style="word-break: break-all; color: #E91E8C;">https://entradas.jardin.com?utm_source=influencer_ana_lopez&amp;utm_medium=influencer&amp;utm_campaign=jardin_delicias_sevilla_2026&amp;utm_content=black_friday</code>
</div>

<h2 style="font-size: 17px; color: #0F3460; margin-top: 24px; margin-bottom: 10px; border-bottom: 2px solid #E91E8C; padding-bottom: 4px;">9. Buenas prácticas</h2>
<div style="background: #FFF8E1; border-left: 4px solid #F5C518; padding: 12px; margin: 12px 0; font-size: 13px;">
  <strong>Consejo:</strong> Usa siempre esta herramienta. Evita escribir UTMs a mano para mantener la coherencia en analítica.
</div>
<ul style="margin: 10px 0 10px 20px; font-size: 13px; line-height: 1.8;">
  <li>Usa siempre minúsculas y guiones bajos en los valores UTM.</li>
  <li>No modifiques la URL generada manualmente.</li>
  <li>Genera un enlace nuevo por cada combinación de canal + ciudad + promoción.</li>
  <li>Para influencers y afiliados, usa siempre el nombre real.</li>
  <li>El campo "Nombre de la promoción" diferencia campañas dentro del mismo canal.</li>
</ul>

<div style="margin-top: 30px; padding-top: 12px; border-top: 1px solid #e0e0e0; font-size: 11px; color: #999; text-align: center;">
  NeXe es una herramienta desarrollada por <strong>La Vida es Maravillosa</strong> para uso exclusivo del <strong>Festival Jardín de las Delicias</strong>.
</div>

</div>`;

    html2pdf()
      .set({
        margin: [10, 10, 10, 10],
        filename: 'NeXe_Manual_UTMs.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      })
      .from(container)
      .save();
  };

  const saveToSheet = async () => {
    if (!GOOGLE_SCRIPT_URL || !finalUrl) return;

    setSaving(true);
    setSaveError('');

    try {
      await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({
          timestamp: new Date().toISOString(),
          usuario,
          alias,
          url_base: baseUrl,
          ciudad: city,
          canal: channel,
          utm_source: getSource(),
          utm_medium: selectedChannel.medium,
          utm_campaign: utmCampaign,
          utm_content: utmContent ? normalize(utmContent) : '',
          url_final: finalUrl,
        }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setSaveError('Error al guardar en Google Sheets');
      setTimeout(() => setSaveError(''), 3000);
    } finally {
      setSaving(false);
    }
  };

  const handleCopy = async () => {
    if (!finalUrl) return;

    try {
      await navigator.clipboard.writeText(finalUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      saveToSheet();
    } catch (err) {
      console.error('Error al copiar:', err);
    }
  };

  return (
    <div className="min-h-screen bg-festival-gradient relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-festival-pink/10 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-festival-teal/10 rounded-full blur-3xl animate-pulse-slow-delayed" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-festival-gold/5 rounded-full blur-3xl" />
      </div>

      {/* Top bar with logos */}
      <div className="relative z-10 pt-8 md:pt-10">
        <div className="flex items-center justify-center gap-12 md:gap-24">
          <img
            src="/images/lvm.png"
            alt="Life is Wonderful"
            className="w-40 md:w-56"
          />
          <img
            src="/images/z JDLD 1.91_1_Logo JDLD25.jpg"
            alt="Jardín de las Delicias Festival"
            className="w-40 md:w-56 rounded-xl shadow-lg shadow-festival-pink/20 ring-1 ring-white/10"
          />
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 md:py-12 relative z-10">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <header className="text-center mb-10 animate-fade-in">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-3 tracking-tight flex items-center justify-center gap-3">
              <Link2 className="w-8 h-8 md:w-10 md:h-10 text-festival-pink" />
              NeXe
            </h1>
            <p className="text-lg md:text-xl text-white/70 font-semibold">
              Generador de UTMs
            </p>
            <p className="text-sm md:text-base text-white/40 max-w-xl mx-auto">
              Crea UTMs personalizadas para las campañas del festival
            </p>
            <div className="flex items-center justify-center gap-2 mt-4">
              <div className="h-px w-12 bg-gradient-to-r from-transparent to-festival-pink/50" />
              <Sparkles className="w-4 h-4 text-festival-gold" />
              <span className="text-xs font-semibold uppercase tracking-widest text-festival-gold">
                Herramienta interna
              </span>
              <Sparkles className="w-4 h-4 text-festival-gold" />
              <div className="h-px w-12 bg-gradient-to-l from-transparent to-festival-pink/50" />
            </div>
            <button
              onClick={() => setShowManual(true)}
              className="mt-5 inline-flex items-center gap-2 px-6 py-2.5 bg-festival-teal/20 hover:bg-festival-teal/30 border border-festival-teal/30 rounded-full text-sm font-semibold text-festival-teal-light hover:text-white transition-all duration-200"
            >
              <BookOpen className="w-4 h-4" />
              Ver manual de uso
            </button>
            <a
              href="https://docs.google.com/spreadsheets/d/1jULq22hV2beqPoOy2flUx-pItJJsIWE_9GC64264B40/edit?gid=0#gid=0"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-2 px-6 py-2.5 bg-festival-gold/20 hover:bg-festival-gold/30 border border-festival-gold/40 rounded-full text-sm font-semibold text-festival-gold hover:text-white transition-all duration-200"
            >
              <ExternalLink className="w-4 h-4" />
              Ver registros históricos
            </a>
          </header>

          {/* Manual modal */}
          {showManual && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowManual(false)}>
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
              <div
                className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] overflow-y-auto animate-slide-in"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Modal header */}
                <div className="sticky top-0 bg-white border-b border-gray-100 px-8 py-5 flex items-center justify-between rounded-t-2xl z-10">
                  <div>
                    <h2 className="text-xl font-bold text-festival-dark">NeXe - UTM Generator</h2>
                    <p className="text-sm text-gray-500">Jardín de las Delicias Festival 2026</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleDownloadManual}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-festival-teal/10 text-festival-teal-dark hover:bg-festival-teal/20 rounded-lg transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Descargar
                    </button>
                    <button
                      onClick={() => setShowManual(false)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5 text-gray-500" />
                    </button>
                  </div>
                </div>

                {/* Modal content */}
                <div className="px-8 py-6 text-festival-dark text-sm leading-relaxed space-y-6">
                  <section>
                    <h3 className="text-lg font-bold text-festival-pink mb-2">1. ¿Qué son las UTMs?</h3>
                    <p className="text-gray-600">Las UTMs (Urchin Tracking Module) son parámetros que se añaden a una URL para rastrear el origen del tráfico en herramientas de analítica como Google Analytics. Permiten saber exactamente de qué campaña, canal y contenido proviene cada visita.</p>
                  </section>

                  <section>
                    <h3 className="text-lg font-bold text-festival-pink mb-3">2. Parámetros UTM utilizados</h3>
                    <div className="overflow-x-auto rounded-xl border border-gray-200">
                      <table className="w-full text-left text-sm">
                        <thead><tr className="bg-festival-dark text-white"><th className="px-4 py-2.5">Parámetro</th><th className="px-4 py-2.5">Descripción</th><th className="px-4 py-2.5">Ejemplo</th></tr></thead>
                        <tbody className="text-gray-600">
                          <tr className="border-t border-gray-100"><td className="px-4 py-2.5"><code className="text-festival-pink bg-pink-50 px-1.5 py-0.5 rounded text-xs">utm_source</code></td><td className="px-4 py-2.5">Origen del tráfico</td><td className="px-4 py-2.5">google, tiktok, influencer_ana</td></tr>
                          <tr className="border-t border-gray-100 bg-gray-50"><td className="px-4 py-2.5"><code className="text-festival-pink bg-pink-50 px-1.5 py-0.5 rounded text-xs">utm_medium</code></td><td className="px-4 py-2.5">Tipo de canal</td><td className="px-4 py-2.5">cpc, paid_social, email</td></tr>
                          <tr className="border-t border-gray-100"><td className="px-4 py-2.5"><code className="text-festival-pink bg-pink-50 px-1.5 py-0.5 rounded text-xs">utm_campaign</code></td><td className="px-4 py-2.5">Nombre de campaña (auto)</td><td className="px-4 py-2.5">jardin_delicias_madrid_2026</td></tr>
                          <tr className="border-t border-gray-100 bg-gray-50"><td className="px-4 py-2.5"><code className="text-festival-pink bg-pink-50 px-1.5 py-0.5 rounded text-xs">utm_content</code></td><td className="px-4 py-2.5">Promoción (opcional)</td><td className="px-4 py-2.5">black_friday, lanzamiento</td></tr>
                        </tbody>
                      </table>
                    </div>
                  </section>

                  <section>
                    <h3 className="text-lg font-bold text-festival-pink mb-3">3. Canales disponibles</h3>
                    <div className="overflow-x-auto rounded-xl border border-gray-200">
                      <table className="w-full text-left text-sm">
                        <thead><tr className="bg-festival-dark text-white"><th className="px-4 py-2.5">Canal</th><th className="px-4 py-2.5">utm_source</th><th className="px-4 py-2.5">utm_medium</th></tr></thead>
                        <tbody className="text-gray-600">
                          <tr className="border-t border-gray-100"><td className="px-4 py-2.5">SEO orgánico (no pagado)</td><td className="px-4 py-2.5"><code className="text-festival-teal-dark bg-teal-50 px-1.5 py-0.5 rounded text-xs">google</code></td><td className="px-4 py-2.5">organic</td></tr>
                          <tr className="border-t border-gray-100 bg-gray-50"><td className="px-4 py-2.5">SEO orgánico (no pagado)</td><td className="px-4 py-2.5"><code className="text-festival-teal-dark bg-teal-50 px-1.5 py-0.5 rounded text-xs">bing</code></td><td className="px-4 py-2.5">organic</td></tr>
                          <tr className="border-t border-gray-100"><td className="px-4 py-2.5">Redes sociales orgánicas</td><td className="px-4 py-2.5"><code className="text-festival-teal-dark bg-teal-50 px-1.5 py-0.5 rounded text-xs">facebook</code></td><td className="px-4 py-2.5">social</td></tr>
                          <tr className="border-t border-gray-100 bg-gray-50"><td className="px-4 py-2.5">Redes sociales orgánicas</td><td className="px-4 py-2.5"><code className="text-festival-teal-dark bg-teal-50 px-1.5 py-0.5 rounded text-xs">instagram</code></td><td className="px-4 py-2.5">social</td></tr>
                          <tr className="border-t border-gray-100"><td className="px-4 py-2.5">Redes sociales orgánicas</td><td className="px-4 py-2.5"><code className="text-festival-teal-dark bg-teal-50 px-1.5 py-0.5 rounded text-xs">tiktok</code></td><td className="px-4 py-2.5">social</td></tr>
                          <tr className="border-t border-gray-100 bg-gray-50"><td className="px-4 py-2.5">Redes sociales orgánicas</td><td className="px-4 py-2.5"><code className="text-festival-teal-dark bg-teal-50 px-1.5 py-0.5 rounded text-xs">linkedin</code></td><td className="px-4 py-2.5">social</td></tr>
                          <tr className="border-t border-gray-100"><td className="px-4 py-2.5">Redes sociales orgánicas</td><td className="px-4 py-2.5"><code className="text-festival-teal-dark bg-teal-50 px-1.5 py-0.5 rounded text-xs">twitter</code></td><td className="px-4 py-2.5">social</td></tr>
                          <tr className="border-t border-gray-100 bg-gray-50"><td className="px-4 py-2.5">Newsletter / Email marketing</td><td className="px-4 py-2.5"><code className="text-festival-teal-dark bg-teal-50 px-1.5 py-0.5 rounded text-xs">newsletter</code></td><td className="px-4 py-2.5">email</td></tr>
                          <tr className="border-t border-gray-100"><td className="px-4 py-2.5">Afiliados / Partners</td><td className="px-4 py-2.5"><code className="text-festival-teal-dark bg-teal-50 px-1.5 py-0.5 rounded text-xs">{'partnername'}</code></td><td className="px-4 py-2.5">affiliate</td></tr>
                          <tr className="border-t border-gray-100 bg-gray-50"><td className="px-4 py-2.5">Influencers</td><td className="px-4 py-2.5"><code className="text-festival-teal-dark bg-teal-50 px-1.5 py-0.5 rounded text-xs">{'influencer_{nombre}'}</code></td><td className="px-4 py-2.5">influencer</td></tr>
                          <tr className="border-t border-gray-100"><td className="px-4 py-2.5">Paid Search (SEM)</td><td className="px-4 py-2.5"><code className="text-festival-teal-dark bg-teal-50 px-1.5 py-0.5 rounded text-xs">google</code></td><td className="px-4 py-2.5">cpc</td></tr>
                          <tr className="border-t border-gray-100 bg-gray-50"><td className="px-4 py-2.5">Paid Social</td><td className="px-4 py-2.5"><code className="text-festival-teal-dark bg-teal-50 px-1.5 py-0.5 rounded text-xs">{'{{site_source_name}}'}</code></td><td className="px-4 py-2.5">paid_social</td></tr>
                          <tr className="border-t border-gray-100"><td className="px-4 py-2.5">Referral (externo)</td><td className="px-4 py-2.5"><code className="text-festival-teal-dark bg-teal-50 px-1.5 py-0.5 rounded text-xs">blogexterno / sitioexterno</code></td><td className="px-4 py-2.5">referral</td></tr>
                        </tbody>
                      </table>
                    </div>
                  </section>

                  <section>
                    <h3 className="text-lg font-bold text-festival-pink mb-2">4. Ciudades</h3>
                    <p className="text-gray-600 mb-2">Las campañas están segmentadas por ciudad:</p>
                    <div className="flex gap-2 flex-wrap">
                      {cities.map((c) => (
                        <span key={c} className="px-3 py-1 bg-festival-dark text-white rounded-full text-xs font-semibold">{c}</span>
                      ))}
                    </div>
                    <p className="text-gray-500 text-xs mt-2">Formato automático: <code className="text-festival-pink bg-pink-50 px-1.5 py-0.5 rounded text-xs">jardin_delicias_{'{ciudad}'}_2026</code></p>
                  </section>

                  <section>
                    <h3 className="text-lg font-bold text-festival-pink mb-3">5. Campo Alias</h3>
                    <p className="text-gray-600 mb-3">El <strong>Alias</strong> identifica la fase o tipo de comunicación del enlace generado. Se registra junto al resto de datos en Google Sheets para facilitar el seguimiento.</p>
                    <div className="overflow-x-auto rounded-xl border border-gray-200">
                      <table className="w-full text-left text-sm">
                        <thead><tr className="bg-festival-dark text-white"><th className="px-4 py-2.5">Alias</th><th className="px-4 py-2.5">Cuándo usarlo</th></tr></thead>
                        <tbody className="text-gray-600">
                          <tr className="border-t border-gray-100"><td className="px-4 py-2.5 font-semibold">Registros</td><td className="px-4 py-2.5">Fase de recogida de registros / pre-inscripción</td></tr>
                          <tr className="border-t border-gray-100 bg-gray-50"><td className="px-4 py-2.5 font-semibold">Venta Oficial</td><td className="px-4 py-2.5">Apertura oficial de venta de entradas</td></tr>
                          <tr className="border-t border-gray-100"><td className="px-4 py-2.5 font-semibold">Primer Avance</td><td className="px-4 py-2.5">Primera comunicación de artistas o contenido</td></tr>
                          <tr className="border-t border-gray-100 bg-gray-50"><td className="px-4 py-2.5 font-semibold">Segundo Avance</td><td className="px-4 py-2.5">Segunda comunicación de artistas o contenido</td></tr>
                          <tr className="border-t border-gray-100"><td className="px-4 py-2.5 font-semibold">Full Line Up</td><td className="px-4 py-2.5">Revelación completa del cartel</td></tr>
                        </tbody>
                      </table>
                    </div>
                  </section>

                  <section>
                    <h3 className="text-lg font-bold text-festival-pink mb-3">6. Registros históricos</h3>
                    <p className="text-gray-600 mb-2">Cada URL copiada queda registrada automáticamente en Google Sheets con todos sus parámetros. Puedes consultar el historial completo desde el botón <strong>"Ver registros históricos"</strong> en la pantalla principal.</p>
                    <div className="bg-yellow-50 border-l-4 border-festival-gold p-3 rounded-r-xl text-xs text-gray-600">
                      Los campos registrados son: Timestamp · Usuario · Alias · URL Base · Ciudad · Canal · utm_source · utm_medium · utm_campaign · utm_content · URL Final
                    </div>
                  </section>

                  <section>
                    <h3 className="text-lg font-bold text-festival-pink mb-4">7. Guía visual paso a paso</h3>
                    <div className="space-y-1">
                      {/* Step 1 */}
                      <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                        <div className="flex items-start gap-3 mb-3">
                          <span className="flex-shrink-0 w-7 h-7 rounded-full bg-festival-pink text-white flex items-center justify-center text-xs font-bold">1</span>
                          <div><strong className="text-festival-dark">Introduce la URL base</strong> <span className="text-gray-500">— Debe terminar en .com o .es.</span></div>
                        </div>
                        <div className="ml-10 bg-white rounded-lg border border-gray-300 px-3 py-2 text-xs text-gray-400 font-mono">https://entradas.jardindelasdelicias.com</div>
                      </div>
                      <div className="flex justify-center text-gray-300 text-lg">↓</div>

                      {/* Step 2 */}
                      <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                        <div className="flex items-start gap-3 mb-3">
                          <span className="flex-shrink-0 w-7 h-7 rounded-full bg-festival-pink text-white flex items-center justify-center text-xs font-bold">2</span>
                          <div><strong className="text-festival-dark">Selecciona el Alias</strong> <span className="text-gray-500">— La fase de la campaña.</span></div>
                        </div>
                        <div className="ml-10 bg-white rounded-lg border border-gray-300 px-3 py-2 text-xs text-gray-600 flex items-center justify-between">Venta Oficial <span className="text-gray-400">▼</span></div>
                      </div>
                      <div className="flex justify-center text-gray-300 text-lg">↓</div>

                      {/* Step 3 */}
                      <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                        <div className="flex items-start gap-3 mb-3">
                          <span className="flex-shrink-0 w-7 h-7 rounded-full bg-festival-pink text-white flex items-center justify-center text-xs font-bold">3</span>
                          <div><strong className="text-festival-dark">Selecciona usuario y ciudad</strong> <span className="text-gray-500">— Quién genera y la ciudad de campaña.</span></div>
                        </div>
                        <div className="ml-10 grid grid-cols-2 gap-2">
                          <div className="bg-white rounded-lg border border-gray-300 px-3 py-2 text-xs text-gray-600 flex items-center justify-between">La Vida es Maravillosa <span className="text-gray-400">▼</span></div>
                          <div className="bg-white rounded-lg border border-gray-300 px-3 py-2 text-xs text-gray-600 flex items-center justify-between">Madrid <span className="text-gray-400">▼</span></div>
                        </div>
                      </div>
                      <div className="flex justify-center text-gray-300 text-lg">↓</div>

                      {/* Step 4 */}
                      <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                        <div className="flex items-start gap-3 mb-3">
                          <span className="flex-shrink-0 w-7 h-7 rounded-full bg-festival-pink text-white flex items-center justify-center text-xs font-bold">4</span>
                          <div><strong className="text-festival-dark">Selecciona canal y fuente</strong> <span className="text-gray-500">— El canal y la fuente concreta.</span></div>
                        </div>
                        <div className="ml-10 grid grid-cols-2 gap-2">
                          <div className="bg-white rounded-lg border border-gray-300 px-3 py-2 text-xs text-gray-600 flex items-center justify-between">Redes sociales orgánicas <span className="text-gray-400">▼</span></div>
                          <div className="bg-white rounded-lg border border-festival-teal px-3 py-2 text-xs text-festival-teal-dark flex items-center justify-between">Instagram <span className="text-gray-400">▼</span></div>
                        </div>
                        <p className="ml-10 mt-2 text-[11px] text-gray-400 italic">* Para Influencers / Afiliados / Referral aparece un campo de texto libre.</p>
                      </div>
                      <div className="flex justify-center text-gray-300 text-lg">↓</div>

                      {/* Step 5 */}
                      <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                        <div className="flex items-start gap-3 mb-3">
                          <span className="flex-shrink-0 w-7 h-7 rounded-full bg-festival-pink text-white flex items-center justify-center text-xs font-bold">5</span>
                          <div><strong className="text-festival-dark">Promoción (opcional)</strong> <span className="text-gray-500">— Si el enlace va asociado a una promo.</span></div>
                        </div>
                        <div className="ml-10 bg-white rounded-lg border border-gray-300 px-3 py-2 text-xs text-gray-400 font-mono">black_friday</div>
                      </div>
                      <div className="flex justify-center text-gray-300 text-lg">↓</div>

                      {/* Step 6 */}
                      <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                        <div className="flex items-start gap-3 mb-3">
                          <span className="flex-shrink-0 w-7 h-7 rounded-full bg-festival-pink text-white flex items-center justify-center text-xs font-bold">6</span>
                          <div><strong className="text-festival-dark">Revisa y copia la URL</strong> <span className="text-gray-500">— Verifica los parámetros y copia. Se guarda automáticamente en Sheets.</span></div>
                        </div>
                        <div className="ml-10 space-y-2">
                          <div className="bg-white rounded-lg border border-gray-200 px-3 py-2 text-[10px] text-gray-500 font-mono">
                            <div className="flex gap-2"><span className="text-gray-400 w-20">utm_source</span><span className="text-festival-teal-dark">instagram</span></div>
                            <div className="flex gap-2"><span className="text-gray-400 w-20">utm_medium</span><span className="text-festival-teal-dark">social</span></div>
                            <div className="flex gap-2"><span className="text-gray-400 w-20">utm_campaign</span><span className="text-festival-teal-dark">jardin_delicias_madrid_2026</span></div>
                            <div className="flex gap-2"><span className="text-gray-400 w-20">utm_content</span><span className="text-festival-teal-dark">black_friday</span></div>
                          </div>
                          <div className="bg-gradient-to-r from-pink-500 to-pink-600 text-white text-center text-xs font-semibold py-2 rounded-lg">Copiar URL</div>
                        </div>
                      </div>
                    </div>
                  </section>

                  <section>
                    <h3 className="text-lg font-bold text-festival-pink mb-3">6. Ejemplo práctico</h3>
                    <div className="bg-gray-50 border-l-4 border-festival-teal p-4 rounded-r-xl mb-3">
                      <p className="font-semibold text-festival-dark mb-1">Paid Social en Madrid</p>
                      <code className="block text-xs text-gray-600 bg-white p-3 rounded-lg break-all mt-2">https://entradas.jardin.com?utm_source={'{{site_source_name}}'}&utm_medium=paid_social&utm_campaign=jardin_delicias_madrid_2026</code>
                    </div>
                    <div className="bg-gray-50 border-l-4 border-festival-teal p-4 rounded-r-xl mb-3">
                      <p className="font-semibold text-festival-dark mb-1">Redes sociales orgánicas (Instagram) en Valencia</p>
                      <code className="block text-xs text-gray-600 bg-white p-3 rounded-lg break-all mt-2">https://entradas.jardin.com?utm_source=instagram&utm_medium=social&utm_campaign=jardin_delicias_valencia_2026</code>
                    </div>
                    <div className="bg-gray-50 border-l-4 border-festival-teal p-4 rounded-r-xl">
                      <p className="font-semibold text-festival-dark mb-1">Influencer "Ana López" en Sevilla + Black Friday</p>
                      <code className="block text-xs text-gray-600 bg-white p-3 rounded-lg break-all mt-2">https://entradas.jardin.com?utm_source=influencer_ana_lopez&utm_medium=influencer&utm_campaign=jardin_delicias_sevilla_2026&utm_content=black_friday</code>
                    </div>
                  </section>

                  <section>
                    <h3 className="text-lg font-bold text-festival-pink mb-2">7. Buenas prácticas</h3>
                    <div className="bg-yellow-50 border-l-4 border-festival-gold p-4 rounded-r-xl mb-3 text-gray-600">
                      <strong>Consejo:</strong> Usa siempre esta herramienta. Evita escribir UTMs a mano para mantener la coherencia en analítica.
                    </div>
                    <ul className="list-disc pl-5 text-gray-600 space-y-1">
                      <li>Usa siempre minúsculas y guiones bajos en los valores UTM.</li>
                      <li>No modifiques la URL generada manualmente.</li>
                      <li>Genera un enlace nuevo por cada combinación de canal + ciudad + promoción.</li>
                      <li>Para influencers y afiliados, usa siempre el nombre real.</li>
                      <li>El campo "Nombre de la promoción" diferencia campañas dentro del mismo canal.</li>
                    </ul>
                  </section>
                </div>

                {/* Modal footer */}
                <div className="sticky bottom-0 bg-white border-t border-gray-100 px-8 py-4 rounded-b-2xl">
                  <p className="text-center text-xs text-gray-400">NeXe es una herramienta desarrollada por <strong className="text-gray-500">La Vida es Maravillosa</strong> para uso exclusivo del <strong className="text-gray-500">Festival Jardín de las Delicias</strong>.</p>
                </div>
              </div>
            </div>
          )}

          {/* Main card */}
          <div className="bg-white/[0.06] backdrop-blur-xl rounded-3xl shadow-2xl p-8 md:p-10 border border-white/10 transition-all duration-300">
            <div className="space-y-6">
              {/* URL base */}
              <div className="space-y-2">
                <label htmlFor="baseUrl" className="block text-sm font-semibold text-white/80">
                  URL base
                </label>
                <input
                  id="baseUrl"
                  type="text"
                  value={baseUrl}
                  onChange={(e) => setBaseUrl(e.target.value)}
                  placeholder="https://tusitio.com"
                  className={`w-full px-4 py-3 bg-white/[0.07] border-2 rounded-xl focus:outline-none focus:ring-4 transition-all duration-200 text-white placeholder:text-white/30 ${baseUrl && !isValidUrl(baseUrl) ? 'border-red-500/60 focus:border-red-500 focus:ring-red-500/20' : 'border-white/10 focus:border-festival-pink focus:ring-festival-pink/20'}`}
                />
                {baseUrl && !isValidUrl(baseUrl) && (
                  <p className="text-xs text-red-400 mt-1">La URL debe terminar en .com o .es (ej: tusitio.com, tusitio.es)</p>
                )}
              </div>

              {/* Alias */}
              <div className="space-y-2">
                <label htmlFor="alias" className="block text-sm font-semibold text-white/80">
                  Alias
                </label>
                <select
                  id="alias"
                  value={alias}
                  onChange={(e) => setAlias(e.target.value as typeof aliases[number])}
                  className="w-full px-4 py-3 bg-white/[0.07] border-2 border-white/10 rounded-xl focus:outline-none focus:border-festival-pink focus:ring-4 focus:ring-festival-pink/20 transition-all duration-200 text-white cursor-pointer appearance-none"
                  style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23ffffff80' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 16px center' }}
                >
                  {aliases.map((a) => (
                    <option key={a} value={a} className="bg-festival-dark text-white">{a}</option>
                  ))}
                </select>
              </div>

              {/* Usuario & Ciudad */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="usuario" className="block text-sm font-semibold text-white/80">
                    Usuario
                  </label>
                  <select
                    id="usuario"
                    value={usuario}
                    onChange={(e) => setUsuario(e.target.value as typeof usuarios[number])}
                    className="w-full px-4 py-3 bg-white/[0.07] border-2 border-white/10 rounded-xl focus:outline-none focus:border-festival-pink focus:ring-4 focus:ring-festival-pink/20 transition-all duration-200 text-white cursor-pointer appearance-none"
                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23ffffff80' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 16px center' }}
                  >
                    {usuarios.map((u) => (
                      <option key={u} value={u} className="bg-festival-dark text-white">
                        {u}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label htmlFor="city" className="block text-sm font-semibold text-white/80">
                    Ciudad
                  </label>
                  <select
                    id="city"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-4 py-3 bg-white/[0.07] border-2 border-white/10 rounded-xl focus:outline-none focus:border-festival-pink focus:ring-4 focus:ring-festival-pink/20 transition-all duration-200 text-white cursor-pointer appearance-none"
                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23ffffff80' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 16px center' }}
                  >
                    {cities.map((c) => (
                      <option key={c} value={c} className="bg-festival-dark text-white">
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Canal & Fuente */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="channel" className="block text-sm font-semibold text-white/80">
                    Canal
                  </label>
                  <select
                    id="channel"
                    value={channel}
                    onChange={(e) => {
                      const newChannel = e.target.value;
                      setChannel(newChannel);
                      setCustomSourceName('');
                      const ch = channels[newChannel];
                      if (ch.sources.length > 0) {
                        setSelectedSource(ch.sources[0].value);
                      }
                    }}
                    className="w-full px-4 py-3 bg-white/[0.07] border-2 border-white/10 rounded-xl focus:outline-none focus:border-festival-pink focus:ring-4 focus:ring-festival-pink/20 transition-all duration-200 text-white cursor-pointer appearance-none"
                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23ffffff80' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 16px center' }}
                  >
                    {Object.keys(channels).map((ch) => (
                      <option key={ch} value={ch} className="bg-festival-dark text-white">
                        {ch}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Source dropdown (when channel has multiple predefined sources) */}
                {selectedChannel.sources.length > 1 && (
                  <div className="space-y-2 animate-slide-in">
                    <label htmlFor="source" className="block text-sm font-semibold text-white/80">
                      Fuente (source)
                    </label>
                    <select
                      id="source"
                      value={selectedSource}
                      onChange={(e) => setSelectedSource(e.target.value)}
                      className="w-full px-4 py-3 bg-white/[0.07] border-2 border-white/10 rounded-xl focus:outline-none focus:border-festival-pink focus:ring-4 focus:ring-festival-pink/20 transition-all duration-200 text-white cursor-pointer appearance-none"
                      style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23ffffff80' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 16px center' }}
                    >
                      {selectedChannel.sources.map((s) => (
                        <option key={s.value} value={s.value} className="bg-festival-dark text-white">
                          {s.label}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Custom source input (for Afiliados, Influencers, Referral) */}
                {selectedChannel.customSource && (
                  <div className="space-y-2 animate-slide-in">
                    <label htmlFor="customSource" className="block text-sm font-semibold text-white/80">
                      {selectedChannel.customLabel}
                    </label>
                    <input
                      id="customSource"
                      type="text"
                      value={customSourceName}
                      onChange={(e) => setCustomSourceName(e.target.value)}
                      placeholder={selectedChannel.customPlaceholder}
                      className="w-full px-4 py-3 bg-white/[0.07] border-2 border-white/10 rounded-xl focus:outline-none focus:border-festival-pink focus:ring-4 focus:ring-festival-pink/20 transition-all duration-200 text-white placeholder:text-white/30"
                    />
                  </div>
                )}
              </div>

              {/* UTM Content */}
              <div className="space-y-2">
                <label htmlFor="utmContent" className="block text-sm font-semibold text-white/80">
                  Nombre de la promoción <span className="text-white/40 font-normal">(opcional)</span>
                </label>
                <input
                  id="utmContent"
                  type="text"
                  value={utmContent}
                  onChange={(e) => setUtmContent(e.target.value)}
                  placeholder="Ej: Black Friday, Lanzamiento, Rebajas..."
                  className="w-full px-4 py-3 bg-white/[0.07] border-2 border-white/10 rounded-xl focus:outline-none focus:border-festival-pink focus:ring-4 focus:ring-festival-pink/20 transition-all duration-200 text-white placeholder:text-white/30"
                />
              </div>

              {/* Generated UTMs */}
              {baseUrl && (
                <div className="mt-8 space-y-6 animate-slide-in">
                  <div className="border-t border-white/10 pt-6">
                    <h3 className="text-xs font-bold text-festival-teal mb-4 uppercase tracking-widest">
                      UTMs generadas
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <span className="text-sm font-semibold text-white/50 min-w-[120px]">
                          utm_source
                        </span>
                        <span className="text-sm text-festival-teal-light font-mono bg-white/[0.05] px-3 py-1 rounded-lg flex-1">
                          {getSource()}
                        </span>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="text-sm font-semibold text-white/50 min-w-[120px]">
                          utm_medium
                        </span>
                        <span className="text-sm text-festival-teal-light font-mono bg-white/[0.05] px-3 py-1 rounded-lg flex-1">
                          {selectedChannel.medium}
                        </span>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="text-sm font-semibold text-white/50 min-w-[120px]">
                          utm_campaign
                        </span>
                        <span className="text-sm text-festival-teal-light font-mono bg-white/[0.05] px-3 py-1 rounded-lg flex-1">
                          {utmCampaign}
                        </span>
                      </div>
                      {utmContent && (
                        <div className="flex items-start gap-3">
                          <span className="text-sm font-semibold text-white/50 min-w-[120px]">
                            utm_content
                          </span>
                          <span className="text-sm text-festival-teal-light font-mono bg-white/[0.05] px-3 py-1 rounded-lg flex-1">
                            {normalize(utmContent)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="border-t border-white/10 pt-6">
                    <h3 className="text-xs font-bold text-festival-teal mb-4 uppercase tracking-widest">
                      URL final
                    </h3>
                    <div className="bg-white/[0.05] rounded-xl p-4 break-all text-sm font-mono text-white/70 border border-white/10">
                      {finalUrl}
                    </div>
                  </div>

                  <button
                    onClick={handleCopy}
                    disabled={!finalUrl || saving}
                    className="w-full bg-gradient-to-r from-festival-pink to-festival-pink-dark hover:from-festival-pink-dark hover:to-festival-pink text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-3 shadow-lg shadow-festival-pink/30 hover:shadow-xl hover:shadow-festival-pink/40 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Guardando...</span>
                      </>
                    ) : copied ? (
                      <>
                        <CheckCircle2 className="w-5 h-5" />
                        <span>URL copiada</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-5 h-5" />
                        <span>Copiar URL</span>
                      </>
                    )}
                  </button>

                  {/* Sheet save feedback */}
                  {saved && (
                    <p className="text-center text-xs text-festival-teal-light animate-slide-in">
                      Registrado en Google Sheets
                    </p>
                  )}
                  {saveError && (
                    <p className="text-center text-xs text-red-400 animate-slide-in">
                      {saveError}
                    </p>
                  )}
                </div>
              )}

              {/* Empty state */}
              {!baseUrl && (
                <div className="mt-8 text-center py-8">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-white/[0.05] rounded-full mb-3 ring-1 ring-white/10">
                    <Sparkles className="w-6 h-6 text-festival-gold/60" />
                  </div>
                  <p className="text-white/30 text-sm">
                    Introduce una URL base para comenzar
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <footer className="mt-8 text-center space-y-1">
            <p className="text-xs text-white/40">
              NeXe es una herramienta desarrollada por <strong className="text-white/60">La Vida es Maravillosa</strong> para uso exclusivo del <strong className="text-white/60">Festival Jardín de las Delicias</strong>.
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
}

export default App;
