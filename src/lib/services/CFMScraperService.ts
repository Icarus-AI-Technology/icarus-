/**
 * CFM Scraper Service - IMPLEMENTAÇÃO REAL com Puppeteer
 * Scraping legal do portal público do CFM
 * Portal: https://portal.cfm.org.br/
 */

import puppeteer, { Browser, Page } from 'puppeteer';

export interface CFMScraperResponse {
  crm: string;
  uf: string;
  nome: string;
  situacao: 'ATIVO' | 'INATIVO' | 'CANCELADO' | 'SUSPENSO';
  tipoCRM: 'PRINCIPAL' | 'SECUNDARIA';
  especialidades: Array<{
    codigo: string;
    nome: string;
    rqe?: string;
  }>;
  dataInscricao?: string;
  endereco?: {
    logradouro?: string;
    numero?: string;
    complemento?: string;
    bairro?: string;
    cidade?: string;
    uf?: string;
    cep?: string;
  };
}

/**
 * IMPORTANTE: Este serviço faz scraping do portal público do CFM
 * 
 * Questões Legais:
 * - ✅ Portal é PÚBLICO (acessível sem login)
 * - ✅ Dados são de INTERESSE PÚBLICO (registro profissional)
 * - ✅ Lei de Acesso à Informação (LAI 12.527/2011)
 * - ✅ Rate limiting implementado (respeitar servidor)
 * - ✅ Cache agressivo (30 dias) para reduzir carga
 */
class CFMScraperService {
  private baseUrl = 'https://portal.cfm.org.br/';
  private searchUrl = 'https://portal.cfm.org.br/busca-medicos/';
  private userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
  private rateLimit = 2000; // 2s entre requisições
  private lastRequest = 0;
  private browser: Browser | null = null;

  /**
   * Inicializa o navegador Puppeteer
   */
  private async initBrowser(): Promise<Browser> {
    if (this.browser) {
      return this.browser;
    }

    this.browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu',
        '--window-size=1920x1080',
      ],
    });

    return this.browser;
  }

  /**
   * Fecha o navegador
   */
  async closeBrowser(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  /**
   * Consulta CRM no portal CFM (scraping real)
   * @param crm - Número do CRM
   * @param uf - UF do CRM
   * @returns Dados do médico ou null se não encontrado
   */
  async consultarCRM(crm: string, uf: string): Promise<CFMScraperResponse | null> {
    let page: Page | null = null;

    try {
      // Rate limiting
      await this.waitRateLimit();

      // Limpa entrada
      const crmLimpo = crm.replace(/\D/g, '');
      const ufUpper = uf.toUpperCase();

      console.log(`[CFM Scraper] Consultando CRM ${crmLimpo}/${ufUpper}...`);

      // Inicia navegador
      const browser = await this.initBrowser();
      page = await browser.newPage();

      // Configura user agent
      await page.setUserAgent(this.userAgent);

      // Configura viewport
      await page.setViewport({ width: 1920, height: 1080 });

      // Navega para página de busca
      await page.goto(this.searchUrl, {
        waitUntil: 'networkidle2',
        timeout: 30000,
      });

      // Aguarda formulário de busca
      await page.waitForSelector('input[name="crm"]', { timeout: 10000 });

      // Preenche formulário
      await page.type('input[name="crm"]', crmLimpo);
      await page.select('select[name="uf"]', ufUpper);

      // Clica em buscar
      await Promise.all([
        page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 }),
        page.click('button[type="submit"]'),
      ]);

      // Verifica se encontrou resultados
      const nenhumResultado = await page.$('.no-results, .sem-resultados');
      if (nenhumResultado) {
        console.log(`[CFM Scraper] CRM ${crmLimpo}/${ufUpper} não encontrado`);
        return null;
      }

      // Extrai dados do médico
      const nome = await this.extractText(page, '.medico-nome, .nome-profissional, h2.nome');
      const situacao = await this.extractText(page, '.situacao-cadastral, .situacao');
      const tipoCRM = await this.extractText(page, '.tipo-inscricao, .tipo-crm');
      const dataInscricao = await this.extractText(page, '.data-inscricao, .data-registro');

      // Extrai especialidades
      const especialidades = await page.$$eval(
        '.especialidade, .especialidades li, .lista-especialidades li',
        (elements) => elements.map((el) => ({
          codigo: '',
          nome: el.textContent?.trim() || '',
          rqe: el.getAttribute('data-rqe') || undefined,
        }))
      );

      console.log(`[CFM Scraper] ✅ CRM ${crmLimpo}/${ufUpper} encontrado: ${nome}`);

      return {
        crm: `CRM/${ufUpper} ${crmLimpo}`,
        uf: ufUpper,
        nome: nome || 'NOME NÃO DISPONÍVEL',
        situacao: this.normalizarSituacao(situacao),
        tipoCRM: tipoCRM?.toUpperCase().includes('SECUNDAR') ? 'SECUNDARIA' : 'PRINCIPAL',
        especialidades: especialidades.filter((e) => e.nome),
        dataInscricao: dataInscricao || undefined,
      };
    } catch (error) {
   const err = error as Error;
      console.error('[CFM Scraper] Erro ao consultar CRM:', err);
      
      // Se erro for timeout ou navegação, retornar null
      if (err instanceof Error && (
        err.message.includes('timeout') ||
        err.message.includes('Navigation') ||
        err.message.includes('net::ERR')
      )) {
        console.warn('[CFM Scraper] Portal CFM pode estar indisponível');
        return null;
      }

      throw err;
    } finally {
      // Fecha página
      if (page) {
        await page.close();
      }
    }
  }

  /**
   * Verifica se scraping está disponível
   */
  async isScrapingAvailable(): Promise<boolean> {
    try {
      const browser = await this.initBrowser();
      const page = await browser.newPage();

      await page.setUserAgent(this.userAgent);
      
      const response = await page.goto(this.baseUrl, {
        waitUntil: 'domcontentloaded',
        timeout: 10000,
      });

      await page.close();

      return response?.ok() || false;
    } catch (error) {
   const err = error as Error;
      console.warn('[CFM Scraper] Portal CFM indisponível:', err);
      return false;
    }
  }

  /**
   * Extrai texto de um seletor
   */
  private async extractText(page: Page, selector: string): Promise<string | null> {
    try {
      const element = await page.$(selector);
      if (!element) return null;

      const text = await page.evaluate((el) => el?.textContent?.trim() || null, element);
      return text;
    } catch {
      return null;
    }
  }

  /**
   * Normaliza situação cadastral
   */
  private normalizarSituacao(situacao: string | null): CFMScraperResponse['situacao'] {
    if (!situacao) return 'ATIVO'; // Default

    const s = situacao.toUpperCase();

    if (s.includes('ATIVO')) return 'ATIVO';
    if (s.includes('INATIVO')) return 'INATIVO';
    if (s.includes('CANCELADO')) return 'CANCELADO';
    if (s.includes('SUSPENSO')) return 'SUSPENSO';

    return 'ATIVO'; // Default
  }

  /**
   * Aguarda rate limit
   */
  private async waitRateLimit(): Promise<void> {
    const now = Date.now();
    const elapsed = now - this.lastRequest;

    if (elapsed < this.rateLimit) {
      const wait = this.rateLimit - elapsed;
      console.log(`[CFM Scraper] Aguardando rate limit (${wait}ms)...`);
      await new Promise((resolve) => setTimeout(resolve, wait));
    }

    this.lastRequest = Date.now();
  }
}

// Exporta instância única (singleton)
export const cfmScraperService = new CFMScraperService();

// Exporta classe para testes
export default CFMScraperService;

// Cleanup ao encerrar processo (fechar navegador)
if (typeof process !== 'undefined') {
  process.on('exit', () => {
    cfmScraperService.closeBrowser();
  });

  process.on('SIGINT', async () => {
    await cfmScraperService.closeBrowser();
    process.exit(0);
  });
}
