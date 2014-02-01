package controller


class NgController extends ApplicationController {
  override val scalateExtension = "jade"

  def container = render("/ng/container")

}

