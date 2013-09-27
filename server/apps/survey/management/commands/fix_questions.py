from django.core.management.base import BaseCommand, CommandError

from survey.models import Question, Option, Block, Page


class Command(BaseCommand):
    help = 'Save All Responses'

    def handle(self, *args, **options):
        colA = Option.objects.get(pk=1)
        colB = Option.objects.get(pk=2) 
        for page in Page.objects.all():
            page.blocks.clear()
            page.save()
        for question in Question.objects.all():
            if question.slug.find('lobster') != -1:
                page = Page.objects.get(questions=question)
                #page.blocks.clear()
                page.blocks.add(Block.objects.get(name="Lobster Traps"))
                page.save()
            elif question.slug.find('fish-traps') != -1:
                page = Page.objects.get(questions=question)
                #page.blocks.clear()
                page.blocks.add(Block.objects.get(name="Fish Traps"))
                page.save()
            elif question.slug.find('traps') != -1:
                page = Page.objects.get(questions=question)
                #page.blocks.clear()
                page.blocks.add(Block.objects.get(name="Traps"))
                page.save()
            if question.slug.find('line') != -1:
                page = Page.objects.get(questions=question)
                #page.blocks.clear()
                page.blocks.add(Block.objects.get(name="Line or Reel"))
                page.save()
            if question.slug.find('spear') != -1 or question.slug.find('dive') != -1:
                page = Page.objects.get(questions=question)
                #page.blocks.clear()
                page.blocks.add(Block.objects.get(name="Spear or By Hand"))
                page.save()
            if question.slug.find('net') != -1:
                page = Page.objects.get(questions=question)
                #page.blocks.clear()
                page.blocks.add(Block.objects.get(name="Nets"))
                page.save()
            if question.slug.endswith('st-thomas-st-john'):
                page = Page.objects.get(questions=question)
                #page.blocks.clear()
                page.blocks.add(Block.objects.get(name="St. Thomas or St. John"))
                page.save()
            elif question.slug.endswith('st-croix'):
                page = Page.objects.get(questions=question)
                page.blocks.add(Block.objects.get(name="St. Croix"))
                #page.blocks.clear()
                page.save()
            elif question.slug.endswith('st-thomas'):
                page = Page.objects.get(questions=question)
                #page.blocks.clear()
                page.blocks.add(Block.objects.get(name="St. Thomas"))
                page.save()
            elif question.slug.endswith('st-john'):
                page = Page.objects.get(questions=question)
                #page.blocks.clear()
                page.blocks.add(Block.objects.get(name="St. John"))
                page.save()
            if question.type == 'grid':
                question.options.clear()
                question.grid_cols.add(colA)
                question.grid_cols.add(colB)
                question.save()