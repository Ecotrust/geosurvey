from django.core.management.base import BaseCommand, CommandError

from survey.models import Question, Option, Block, Page


class Command(BaseCommand):
    help = 'Save All Responses'

    def handle(self, *args, **options):
        colA = Option.objects.get(pk=1)
        # colB = Option.objects.get(pk=2) 
        for page in Page.objects.all():
            page.blocks.clear()
            page.save()

        for block in Block.objects.all():
            if block.name == 'Placeholder':
                continue

            if block.name in ['Puerto Rico', 'St. Thomas', 'St. John', 'St. Thomas or St. John', 'St. Croix']:
                block.skip_question = Question.objects.get(slug='island')
            elif block.name in ['Partner Info']:
                block.skip_question = Question.objects.get(slug='did-other-permit-holders-split-catch')
            elif block.name in ['Line or Reel', 'Traps', 'Nets', 'Lobster Traps', 'Fish Traps', 'Spear or By Hand']:
                block.skip_question = Question.objects.get(slug='gear-type')
            block.save()

        for question in Question.objects.all():
            if question.survey_slug == 'NA':
                continue

            if question.slug.find('partner') != -1:
                page = Page.objects.get(questions=question)
                #page.blocks.clear()
                page.blocks.add(Block.objects.get(name="Partner Info"))
                page.save()
            
            if question.slug.find('fad') != -1:
                page = Page.objects.get(questions=question)
                #page.blocks.clear()
                page.blocks.add(Block.objects.get(name="Line or Reel"))
                page.save()
            
            if question.slug == 'hours-fished':
                page = Page.objects.get(questions=question)
                #page.blocks.clear()
                page.blocks.add(Block.objects.get(name="Line or Reel"))
                page.save()
            
            if question.slug.find('lobster-traps') != -1:
                page = Page.objects.get(questions=question)
                #page.blocks.clear()
                page.blocks.add(Block.objects.get(name="Lobster Traps"))
                page.save()
            elif question.slug.find('fish-traps') != -1:
                page = Page.objects.get(questions=question)
                #page.blocks.clear()
                page.blocks.add(Block.objects.get(name="Fish Traps"))
                page.save()
            elif question.slug.find('trap') != -1:
                page = Page.objects.get(questions=question)
                #page.blocks.clear()
                page.blocks.add(Block.objects.get(name="Traps"))
                page.save()
            
            if question.slug.find('line') != -1:
                page = Page.objects.get(questions=question)
                #page.blocks.clear()
                page.blocks.add(Block.objects.get(name="Line or Reel"))
                page.save()
            elif question.slug.find('spear') != -1 or question.slug.find('dive') != -1:
                page = Page.objects.get(questions=question)
                #page.blocks.clear()
                page.blocks.add(Block.objects.get(name="Spear or By Hand"))
                page.save()
            elif question.slug.find('net') != -1:
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
                # question.grid_cols.add(colB)
                question.save()

