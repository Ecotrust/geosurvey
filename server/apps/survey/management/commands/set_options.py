from django.core.management.base import BaseCommand, CommandError

from survey.models import Question


class Command(BaseCommand):
    help = 'Save All Responses'

    def handle(self, *args, **options):
        for question in Question.objects.all():
            rows = []
            cols = []
            for option in question.options.all():
                rows.append(option.text)
            if len(rows):
                question.rows = "\n".join(rows)
                question.save()
            for option in question.grid_cols.all():
                cols.append(option.text)
            if len(rows):
                question.cols = "\n".join(cols)
                question.save()
