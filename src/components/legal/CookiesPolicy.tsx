import Link from "next/link";

/**
 * Zásady cookies – odpovídají tomu, co web skutečně ukládá.
 * Při přidání analytiky nebo reklamy je nutné doplnit souhlas (cookie lištu) a tuto stránku.
 */
export function CookiesPolicy() {
  return (
    <>
      <p>
        Cookies jsou malé textové soubory, které si webová stránka ukládá do vašeho prohlížeče. Podobně funguje i takzvané místní úložiště prohlížeče (localStorage). Na této stránce popisujeme, co přesně si náš web do vašeho zařízení ukládá.
      </p>

      <h2>Jaké cookies a údaje v prohlížeči používáme</h2>
      <p>
        Při první návštěvě se zobrazí okno <strong>Nastavení soukromí</strong>. Nezbytné údaje se ukládají vždy, pohodlné funkce jen s vaším souhlasem. Svou volbu můžete kdykoli změnit odkazem „Nastavení soukromí“ v patičce webu. Při odmítnutí se pohodlné funkce nezapisují a dříve uložené údaje se smažou.
      </p>
      <table>
        <thead>
          <tr>
            <th>Název</th>
            <th>Typ a účel</th>
            <th>Doba uložení</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>fl_consent</td>
            <td><strong>Nezbytné.</strong> Místní úložiště prohlížeče. Pamatuje si vaši volbu v okně Nastavení soukromí, aby se okno nezobrazovalo při každé stránce. Neobsahuje osobní údaje.</td>
            <td>12 měsíců</td>
          </tr>
          <tr>
            <td>fl_admin_session</td>
            <td><strong>Nezbytné.</strong> Cookie. Udržuje přihlášení do administrace webu. Nastavuje se pouze správcům webu, běžným návštěvníkům ne.</td>
            <td>7 dní nebo do odhlášení</td>
          </tr>
          <tr>
            <td>fl_wanted_session</td>
            <td><strong>Nezbytné.</strong> Úložiště relace prohlížeče. Během jedné návštěvy si pamatuje, zda jste v katalogu používali filtry, zda jste si vybrali vůz a jak dlouho jste na webu, aby se okno „Nenašli jste, co hledáte?“ nabídlo ve vhodnou chvíli. Neobsahuje osobní údaje a neodesílá se na server.</td>
            <td>Do zavření karty prohlížeče</td>
          </tr>
          <tr>
            <td>ab_theme</td>
            <td><strong>Pohodlné funkce (se souhlasem).</strong> Místní úložiště prohlížeče. Pamatuje si, zda jste zvolili světlý, nebo tmavý režim. Neobsahuje osobní údaje a neodesílá se na server.</td>
            <td>Do smazání v prohlížeči</td>
          </tr>
          <tr>
            <td>fl_favorites</td>
            <td><strong>Pohodlné funkce (se souhlasem).</strong> Místní úložiště prohlížeče. Seznam čísel vozů, které jste si uložili do oblíbených (bez registrace). Neodesílá se na server, na jiném zařízení ho neuvidíte.</td>
            <td>Do smazání v prohlížeči</td>
          </tr>
          <tr>
            <td>fl_wanted</td>
            <td><strong>Pohodlné funkce (se souhlasem).</strong> Místní úložiště prohlížeče. Pamatuje si, že jste zavřeli nebo odeslali okno „Nenašli jste, co hledáte?“, kolikrát se okno samo ukázalo a zda se má zobrazit bublinka „Auto na přání“ (30 dní po zavření, 60 dní po odeslání se okno nenabízí). Neobsahuje osobní údaje a neodesílá se na server.</td>
            <td>Nejdéle 60 dní</td>
          </tr>
        </tbody>
      </table>
      <p>
        <strong>Analytické, reklamní ani sledovací cookies nepoužíváme.</strong> Údaje označené jako nezbytné jsou potřeba k fungování webu nebo k provedení vámi zvolené akce, proto k nim souhlas nepotřebujeme (§ 89 odst. 3 zákona č. 127/2005 Sb., o elektronických komunikacích). Pohodlné funkce ukládáme jen s vaším souhlasem.
      </p>

      <h2>Obsah třetích stran</h2>
      <p>
        Mapa Google na stránce <Link href="/kontakt">Kontakt</Link> se načte až po kliknutí na tlačítko „Zobrazit mapu“. Od té chvíle může společnost Google ve vašem prohlížeči ukládat vlastní cookies podle svých{" "}
        <a href="https://policies.google.com/technologies/cookies?hl=cs" target="_blank" rel="noopener noreferrer">zásad používání cookies</a>. Dokud mapu nezobrazíte, Google o vaší návštěvě neví.
      </p>
      <p>Odkazy na WhatsApp, Facebook nebo Instagram vás přesměrují na weby a aplikace jejich provozovatelů. Tam platí jejich vlastní pravidla pro cookies.</p>

      <h2>Jak cookies spravovat</h2>
      <p>
        Uložené cookies a data webu můžete kdykoli smazat nebo jejich ukládání zablokovat v nastavení svého prohlížeče (obvykle v části Soukromí nebo Zabezpečení). Pokud smažete údaj ab_theme, web znovu použije režim podle nastavení vašeho zařízení. Pokud smažete fl_favorites, ztratíte seznam oblíbených aut. Pokud smažete fl_wanted, může se okno „Nenašli jste, co hledáte?“ zobrazit znovu. Pokud smažete fl_consent, zobrazí se okno Nastavení soukromí znovu.
      </p>

      <h2>Další informace</h2>
      <p>
        Jak zpracováváme osobní údaje, popisujeme na stránce <Link href="/ochrana-osobnich-udaju">Ochrana osobních údajů</Link>. Pokud začneme používat další cookies (například pro měření návštěvnosti), tuto stránku aktualizujeme a předem vás požádáme o souhlas.
      </p>
    </>
  );
}
