# TODO

- ostylować task
- uniemożliwić usuwanie tasków

- zablokować możliwość startu sprintu jeżeli jakiś inny jest aktywny (po stronie serwera też, na update kolekcji w allow/deny)

- dodać parametr per_page=1000000 dla wszystkich zapytań do serwera gitlabowego (na pewno dla milestones, bo teraz pokazuje tylko 20)
  w nxt-gitlab ApiBaseHTTP.coffee w funkcji prepare_opts (linia 33) dodać per_page
  
- zabezpieczenie przed modyfikacją/dodawaniem issues do obcego projekty
- zabezpieczenie przed modyfikacją/dodawaniem milestones do obcego projekty
- zabezpieczenie przed modyfikacją/dodawaniem tasks do obcego projekty
  
- Otwieranie projektu, który został usunięty

- update sprintu w gitlabie gdy zmieniony został w meteorze <-- TEGO SIE NIE DA Z UWAGI NA API GITLABA

- testowanie połączenia Gitlab - Scrumlab na localhost: ngrok

# ScrumLab
Meteor Scrum board with gitlab integration




## Installation



[issue+] dodano nowy issue do Meteora
[issue*] zmodyfikowano issue do Meteora
[issue^] wypchniętno zmiany z Meteora do Gitlaba