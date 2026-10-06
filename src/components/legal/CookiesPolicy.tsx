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
      <p>Používáme pouze to, co je nezbytné pro fungování webu nebo co si sami nastavíte:</p>
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
            <td>ab_theme</td>
            <td>Místní úložiště prohlížeče. Pamatuje si, zda jste zvolili světlý, nebo tmavý režim. Neobsahuje osobní údaje a neodesílá se na server.</td>
            <td>Do smazání v prohlížeči</td>
          </tr>
          <tr>
            <td>fl_admin_session</td>
            <td>Nezbytná cookie. Udržuje přihlášení do administrace webu. Nastavuje se pouze správcům webu, běžným návštěvníkům ne.</td>
            <td>7 dní nebo do odhlášení</td>
          </tr>
        </tbody>
      </table>
      <p>
        <strong>Analytické, reklamní ani sledovací cookies nepoužíváme.</strong> Protože ukládáme jen údaje nezbytné pro provoz webu nebo pro vámi zvolené nastavení, nepotřebujeme k nim váš souhlas (§ 89 odst. 3 zákona č. 127/2005 Sb., o elektronických komunikacích). Proto se vám na webu nezobrazuje cookie lišta.
      </p>

      <h2>Obsah třetích stran</h2>
      <p>
        Mapa Google na stránce <Link href="/kontakt">Kontakt</Link> se načte až po kliknutí na tlačítko „Zobrazit mapu“. Od té chvíle může společnost Google ve vašem prohlížeči ukládat vlastní cookies podle svých{" "}
        <a href="https://policies.google.com/technologies/cookies?hl=cs" target="_blank" rel="noopener noreferrer">zásad používání cookies</a>. Dokud mapu nezobrazíte, Google o vaší návštěvě neví.
      </p>
      <p>Odkazy na WhatsApp, Facebook nebo Instagram vás přesměrují na weby a aplikace jejich provozovatelů. Tam platí jejich vlastní pravidla pro cookies.</p>

      <h2>Jak cookies spravovat</h2>
      <p>
        Uložené cookies a data webu můžete kdykoli smazat nebo jejich ukládání zablokovat v nastavení svého prohlížeče (obvykle v části Soukromí nebo Zabezpečení). Pokud smažete údaj ab_theme, web znovu použije režim podle nastavení vašeho zařízení.
      </p>

      <h2>Další informace</h2>
      <p>
        Jak zpracováváme osobní údaje, popisujeme na stránce <Link href="/ochrana-osobnich-udaju">Ochrana osobních údajů</Link>. Pokud začneme používat další cookies (například pro měření návštěvnosti), tuto stránku aktualizujeme a předem vás požádáme o souhlas.
      </p>
    </>
  );
}
