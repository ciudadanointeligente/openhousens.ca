* Uses Django 1.7c1 on Python 3.3.3
* Uses [Bootstrap](http://getbootstrap.com/) instead of [Foundation](http://foundation.zurb.com/)
* Deploys to Heroku

## SayIt

* [Adds support for source_url to Akoma Ntoso importer](https://github.com/opennorth/openhousens.ca/issues/2)
* Omits or replaces all SayIt views
* Replaces `SpeechIndex` and `SpeechForm`
* Omits the following apps:
  * `django.contrib.humanize`
  * `django_select2`
* Omits the following middleware:
  * `speeches.middleware.InstanceMiddleware`
